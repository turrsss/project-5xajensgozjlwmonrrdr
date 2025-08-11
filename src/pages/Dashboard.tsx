import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, BookOpen, Trophy, Settings, LogOut, History } from "lucide-react";
import { QuestionPackage, TryoutSession, Payment } from "@/entities";
import { toast } from "@/hooks/use-toast";
import PackageRanking from "@/components/PackageRanking";

const Dashboard = () => {
  const [packages, setPackages] = useState([]);
  const [user, setUser] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [userPayments, setUserPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Get current user from localStorage
      const storedUser = localStorage.getItem('currentUser');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      
      if (!currentUser) {
        navigate('/login');
        return;
      }

      const [packageList, sessions, payments] = await Promise.all([
        QuestionPackage.filter({ is_active: true }, '-created_at', 10),
        TryoutSession.filter({ user_id: currentUser.id }, '-created_at', 5),
        Payment.filter({ user_id: currentUser.id, status: 'completed' })
      ]);
      
      setUser(currentUser);
      setPackages(packageList);
      setRecentSessions(sessions);
      setUserPayments(payments);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('currentUser');
      toast({
        title: "Logout berhasil",
        description: "Anda telah keluar dari sistem",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal logout",
        variant: "destructive",
      });
    }
  };

  const hasAccessToPackage = (packageData) => {
    if (!packageData.requires_payment) return true;
    return userPayments.some(payment => payment.package_id === packageData.id);
  };

  const handleStartTryout = (packageData) => {
    if (packageData.requires_payment && !hasAccessToPackage(packageData)) {
      navigate(`/payment/${packageData.id}`);
    } else {
      navigate(`/tryout/${packageData.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">SKD CPNS Tryout</h1>
              <p className="text-gray-600">Selamat datang, {user?.full_name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/history">
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Riwayat
                </Button>
              </Link>
              {user?.is_admin && (
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paket Tersedia</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{packages.length}</div>
              <p className="text-xs text-muted-foreground">Paket soal aktif</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tryout Selesai</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentSessions.filter(s => s.status === 'completed').length}</div>
              <p className="text-xs text-muted-foreground">Dari total {recentSessions.length} sesi</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paket Terbeli</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userPayments.length}</div>
              <p className="text-xs text-muted-foreground">Paket yang sudah dibayar</p>
            </CardContent>
          </Card>
        </div>

        {/* Available Packages */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Paket Soal Tersedia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.id} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Package Card */}
                <Card className="lg:col-span-2 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{pkg.title}</CardTitle>
                        <CardDescription>{pkg.description}</CardDescription>
                      </div>
                      {hasAccessToPackage(pkg) && (
                        <Badge variant="default" className="text-xs">Terbeli</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span>Durasi:</span>
                        <span className="font-medium">{pkg.duration_minutes} menit</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Jumlah Soal:</span>
                        <span className="font-medium">{pkg.total_questions}</span>
                      </div>
                      {pkg.requires_payment && (
                        <div className="flex justify-between text-sm">
                          <span>Harga:</span>
                          <span className="font-medium text-green-600">
                            Rp {pkg.price?.toLocaleString('id-ID')}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={() => handleStartTryout(pkg)}
                      disabled={pkg.requires_payment && !hasAccessToPackage(pkg) ? false : false}
                    >
                      {pkg.requires_payment && !hasAccessToPackage(pkg) ? 'Beli & Mulai' : 'Mulai Tryout'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Ranking Card */}
                <div className="lg:col-span-1">
                  <PackageRanking 
                    packageId={pkg.id} 
                    packageTitle={pkg.title}
                    limit={5}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        {recentSessions.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Tryout Terbaru</h2>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">Sesi Tryout</p>
                        <p className="text-sm text-gray-600">
                          {new Date(session.created_at).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                          {session.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                        </Badge>
                        {session.status === 'completed' && (
                          <p className="text-sm text-gray-600 mt-1">
                            Skor: {session.total_score}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;