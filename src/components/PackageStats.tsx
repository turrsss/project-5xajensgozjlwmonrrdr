import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Clock, Target } from "lucide-react";
import { Payment, TryoutSession, User } from "@/entities";

const PackageStats = ({ packageId, packageTitle }) => {
  const [payments, setPayments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (packageId) {
      loadStats();
    }
  }, [packageId]);

  const loadStats = async () => {
    try {
      const [paymentList, sessionList] = await Promise.all([
        Payment.filter({ package_id: packageId, status: 'completed' }),
        TryoutSession.filter({ package_id: packageId, status: 'completed' }, '-total_score', 50)
      ]);

      setPayments(paymentList);
      setSessions(sessionList);

      // Load user data for sessions
      const userIds = [...new Set(sessionList.map(s => s.user_id))];
      const userData = {};
      
      for (const userId of userIds) {
        try {
          const user = await User.get(userId);
          userData[userId] = user;
        } catch (error) {
          console.error(`Error loading user ${userId}:`, error);
        }
      }
      
      setUsers(userData);
    } catch (error) {
      console.error("Error loading package stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Statistik Paket: {packageTitle}</h2>
        <p className="text-gray-600">Data pembayaran dan ranking peserta</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pembayaran</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.length}</div>
            <p className="text-xs text-muted-foreground">User yang sudah bayar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tryout Selesai</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">Sesi completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 
                ? Math.round(sessions.reduce((sum, s) => sum + s.total_score, 0) / sessions.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">Dari semua peserta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Skor Tertinggi</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sessions.length > 0 ? Math.max(...sessions.map(s => s.total_score)) : 0}
            </div>
            <p className="text-xs text-muted-foreground">Best score</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ranking" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ranking">Ranking Nilai</TabsTrigger>
          <TabsTrigger value="payments">Data Pembayaran</TabsTrigger>
        </TabsList>

        <TabsContent value="ranking" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Ranking Peserta</CardTitle>
              <CardDescription>Urutan berdasarkan skor tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              {sessions.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada data tryout</p>
              ) : (
                <div className="space-y-3">
                  {sessions.map((session, index) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">
                            {users[session.user_id]?.full_name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(session.created_at).toLocaleDateString('id-ID')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={getScoreBadgeVariant(session.total_score)}>
                          {session.total_score}
                        </Badge>
                        <p className="text-xs text-gray-600 mt-1">
                          {session.correct_answers}/{session.correct_answers + session.wrong_answers + session.unanswered} benar
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Pembayaran</CardTitle>
              <CardDescription>User yang sudah melakukan pembayaran</CardDescription>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Belum ada pembayaran</p>
              ) : (
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">User ID: {payment.user_id}</p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          Rp {payment.amount?.toLocaleString('id-ID')}
                        </p>
                        <Badge variant="default">Lunas</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PackageStats;