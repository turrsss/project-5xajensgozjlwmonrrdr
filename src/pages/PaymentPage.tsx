import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle, XCircle } from "lucide-react";
import { QuestionPackage, Payment, PaymentSetting } from "@/entities";
import { toast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [payment, setPayment] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [packageId]);

  useEffect(() => {
    let interval;
    if (timeLeft > 0 && payment?.status === 'pending') {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            checkPaymentStatus();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timeLeft, payment]);

  const loadData = async () => {
    try {
      const [pkg, settings] = await Promise.all([
        QuestionPackage.get(packageId),
        PaymentSetting.list('-created_at', 1)
      ]);
      
      setPackageData(pkg);
      setPaymentSettings(settings[0] || null);
      
      // Check for existing pending payment
      const existingPayments = await Payment.filter({ 
        package_id: packageId, 
        status: 'pending' 
      }, '-created_at', 1);
      
      if (existingPayments.length > 0) {
        const existingPayment = existingPayments[0];
        setPayment(existingPayment);
        
        // Calculate time left
        const expiresAt = new Date(existingPayment.expires_at);
        const now = new Date();
        const secondsLeft = Math.max(0, Math.floor((expiresAt - now) / 1000));
        setTimeLeft(secondsLeft);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Gagal memuat data pembayaran",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPayment = async () => {
    try {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + (paymentSettings?.payment_timeout_minutes || 30));
      
      // Generate simple QRIS code (in real implementation, this would be from payment gateway)
      const qrisCode = `${paymentSettings?.qris_merchant_id || 'MERCHANT'}-${Date.now()}`;
      
      const newPayment = await Payment.create({
        package_id: packageId,
        amount: packageData.price,
        payment_method: 'QRIS',
        status: 'pending',
        qris_code: qrisCode,
        expires_at: expiresAt.toISOString(),
      });
      
      setPayment(newPayment);
      setTimeLeft((paymentSettings?.payment_timeout_minutes || 30) * 60);
      
      toast({
        title: "Pembayaran dibuat",
        description: "Silakan scan QRIS code untuk melakukan pembayaran",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal membuat pembayaran",
        variant: "destructive",
      });
    }
  };

  const checkPaymentStatus = async () => {
    if (!payment) return;
    
    try {
      const updatedPayment = await Payment.get(payment.id);
      setPayment(updatedPayment);
      
      if (updatedPayment.status === 'completed') {
        toast({
          title: "Pembayaran berhasil",
          description: "Anda dapat mulai mengerjakan tryout sekarang",
        });
        setTimeout(() => {
          navigate(`/tryout/${packageId}`);
        }, 2000);
      } else if (updatedPayment.status === 'expired' || updatedPayment.status === 'failed') {
        toast({
          title: "Pembayaran gagal",
          description: "Silakan buat pembayaran baru",
          variant: "destructive",
        });
        setPayment(null);
        setTimeLeft(0);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
    }
  };

  const simulatePaymentSuccess = async () => {
    if (!payment) return;
    
    try {
      await Payment.update(payment.id, { status: 'completed' });
      checkPaymentStatus();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memperbarui status pembayaran",
        variant: "destructive",
      });
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!packageData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Paket soal tidak ditemukan</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Pembayaran Paket Soal</CardTitle>
            <CardDescription>Lakukan pembayaran untuk mengakses paket soal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{packageData.title}</h3>
                <p className="text-gray-600">{packageData.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Durasi:</span>
                  <span className="ml-2 font-medium">{packageData.duration_minutes} menit</span>
                </div>
                <div>
                  <span className="text-gray-600">Jumlah Soal:</span>
                  <span className="ml-2 font-medium">{packageData.total_questions}</span>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Pembayaran:</span>
                  <span className="text-2xl font-bold text-green-600">
                    Rp {packageData.price?.toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {!payment ? (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 mb-4">
                Klik tombol di bawah untuk membuat pembayaran QRIS
              </p>
              <Button onClick={createPayment} size="lg">
                Buat Pembayaran QRIS
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Status Pembayaran</span>
                <Badge variant={
                  payment.status === 'completed' ? 'default' :
                  payment.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {payment.status === 'completed' ? 'Berhasil' :
                   payment.status === 'pending' ? 'Menunggu' : 'Gagal'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payment.status === 'pending' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="bg-white p-8 rounded-lg border-2 border-dashed border-gray-300 mb-4">
                      <div className="text-6xl font-mono font-bold text-gray-800 mb-2">
                        QRIS
                      </div>
                      <p className="text-sm text-gray-600">
                        Scan dengan aplikasi pembayaran Anda
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Code: {payment.qris_code}
                      </p>
                    </div>
                    
                    <div className="flex items-center justify-center text-orange-600 mb-4">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">
                        Waktu tersisa: {formatTime(timeLeft)}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <Button onClick={checkPaymentStatus} variant="outline" className="w-full">
                        Cek Status Pembayaran
                      </Button>
                      
                      {/* Demo button - remove in production */}
                      <Button 
                        onClick={simulatePaymentSuccess} 
                        variant="secondary" 
                        className="w-full"
                        size="sm"
                      >
                        [Demo] Simulasi Pembayaran Berhasil
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {payment.status === 'completed' && (
                <div className="text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-700">Pembayaran Berhasil!</h3>
                    <p className="text-gray-600">Anda akan diarahkan ke halaman tryout...</p>
                  </div>
                </div>
              )}
              
              {(payment.status === 'expired' || payment.status === 'failed') && (
                <div className="text-center space-y-4">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-700">Pembayaran Gagal</h3>
                    <p className="text-gray-600">Silakan buat pembayaran baru</p>
                  </div>
                  <Button onClick={() => setPayment(null)}>
                    Buat Pembayaran Baru
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;