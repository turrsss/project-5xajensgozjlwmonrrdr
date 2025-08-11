import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, CheckCircle } from "lucide-react";
import { QuestionPackage, Payment } from "@/entities";
import { toast } from "@/hooks/use-toast";

const PaymentPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('qris');
  const [formData, setFormData] = useState({
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadPackageData();
  }, [packageId]);

  const loadPackageData = async () => {
    try {
      const pkg = await QuestionPackage.get(packageId);
      setPackageData(pkg);
      
      // Pre-fill user data
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      setFormData({
        phone: currentUser.phone || '',
        email: currentUser.email || ''
      });
    } catch (error) {
      console.error("Error loading package:", error);
      toast({
        title: "Error",
        description: "Paket tidak ditemukan",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!formData.phone || !formData.email) {
      toast({
        title: "Data tidak lengkap",
        description: "Mohon lengkapi nomor telepon dan email",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create payment record
      await Payment.create({
        user_id: currentUser.id,
        package_id: packageId,
        amount: packageData.price,
        payment_method: paymentMethod,
        status: 'completed',
        phone: formData.phone,
        email: formData.email,
        transaction_id: `TXN-${Date.now()}`
      });

      toast({
        title: "Pembayaran berhasil!",
        description: "Anda sekarang dapat mengakses paket soal ini",
      });

      // Redirect to tryout
      navigate(`/tryout/${packageId}`);
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Pembayaran gagal",
        description: "Terjadi kesalahan saat memproses pembayaran",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
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
            <p className="text-gray-600">Paket tidak ditemukan</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali
            </Button>
            <div className="ml-4">
              <h1 className="text-2xl font-bold text-gray-900">Pembayaran Paket</h1>
              <p className="text-gray-600">Selesaikan pembayaran untuk mengakses tryout</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Package Info */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Paket</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{packageData.title}</h3>
                <p className="text-gray-600">{packageData.description}</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Durasi:</span>
                  <span className="font-medium">{packageData.duration_minutes} menit</span>
                </div>
                <div className="flex justify-between">
                  <span>Jumlah Soal:</span>
                  <span className="font-medium">{packageData.total_questions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Akses:</span>
                  <Badge variant="default">Selamanya</Badge>
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
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Metode Pembayaran
              </CardTitle>
              <CardDescription>Pilih metode pembayaran dan lengkapi data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Method Selection */}
              <div className="space-y-3">
                <Label>Metode Pembayaran</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      paymentMethod === 'qris' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onClick={() => setPaymentMethod('qris')}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full border-2 ${
                        paymentMethod === 'qris' ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'qris' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                      </div>
                      <div>
                        <p className="font-medium">QRIS</p>
                        <p className="text-sm text-gray-600">Bayar dengan scan QR Code</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <Label>Informasi Kontak</Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="phone">Nomor Telepon</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* QRIS Simulation */}
              {paymentMethod === 'qris' && (
                <div className="text-center p-6 bg-gray-50 rounded-lg">
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <p className="text-gray-500 text-sm">QR Code</p>
                  </div>
                  <p className="text-sm text-gray-600">
                    Scan QR Code dengan aplikasi pembayaran Anda
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    *Ini adalah simulasi demo - pembayaran akan otomatis berhasil
                  </p>
                </div>
              )}

              {/* Payment Button */}
              <Button 
                className="w-full" 
                onClick={handlePayment}
                disabled={processing}
                size="lg"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses Pembayaran...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Bayar Sekarang - Rp {packageData.price?.toLocaleString('id-ID')}
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Dengan melanjutkan, Anda menyetujui syarat dan ketentuan yang berlaku
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;