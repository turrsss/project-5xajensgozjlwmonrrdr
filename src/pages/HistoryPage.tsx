import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Trophy, Clock, Target, TrendingUp } from "lucide-react";
import { TryoutSession, QuestionPackage, UserAnswer } from "@/entities";

const HistoryPage = () => {
  const [sessions, setSessions] = useState([]);
  const [packages, setPackages] = useState({});
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const sessionList = await TryoutSession.list('-created_at', 50);
      setSessions(sessionList);
      
      // Load package data for each session
      const packageIds = [...new Set(sessionList.map(s => s.package_id))];
      const packageData = {};
      
      for (const packageId of packageIds) {
        try {
          const pkg = await QuestionPackage.get(packageId);
          packageData[packageId] = pkg;
        } catch (error) {
          console.error(`Error loading package ${packageId}:`, error);
        }
      }
      
      setPackages(packageData);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSessionDetails = async (session) => {
    try {
      const answers = await UserAnswer.filter({ session_id: session.id });
      setSessionDetails({
        session,
        answers,
        package: packages[session.package_id]
      });
    } catch (error) {
      console.error("Error loading session details:", error);
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

  const calculateStats = () => {
    const completedSessions = sessions.filter(s => s.status === 'completed');
    if (completedSessions.length === 0) return null;

    const totalScore = completedSessions.reduce((sum, s) => sum + s.total_score, 0);
    const averageScore = Math.round(totalScore / completedSessions.length);
    const highestScore = Math.max(...completedSessions.map(s => s.total_score));
    const totalQuestions = completedSessions.reduce((sum, s) => 
      sum + s.correct_answers + s.wrong_answers + s.unanswered, 0);
    const totalCorrect = completedSessions.reduce((sum, s) => sum + s.correct_answers, 0);
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    return {
      totalSessions: completedSessions.length,
      averageScore,
      highestScore,
      accuracy
    };
  };

  const stats = calculateStats();

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
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Riwayat Tryout</h1>
                <p className="text-gray-600">Lihat hasil dan statistik tryout Anda</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="history" className="space-y-6">
          <TabsList>
            <TabsTrigger value="history">Riwayat</TabsTrigger>
            <TabsTrigger value="statistics">Statistik</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-6">
            {sessions.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600 mb-4">Belum ada riwayat tryout</p>
                  <Link to="/dashboard">
                    <Button>Mulai Tryout Pertama</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Session List */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Daftar Tryout</h2>
                  {sessions.map((session) => (
                    <Card 
                      key={session.id} 
                      className={`cursor-pointer transition-shadow hover:shadow-lg ${
                        selectedSession?.id === session.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedSession(session);
                        loadSessionDetails(session);
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">
                              {packages[session.package_id]?.title || 'Paket Tidak Diketahui'}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {new Date(session.created_at).toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
                            {session.status === 'completed' ? 'Selesai' : 'Berlangsung'}
                          </Badge>
                        </div>
                        
                        {session.status === 'completed' && (
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Skor:</span>
                              <span className={`ml-1 font-bold ${getScoreColor(session.total_score)}`}>
                                {session.total_score}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Benar:</span>
                              <span className="ml-1 font-medium text-green-600">
                                {session.correct_answers}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Salah:</span>
                              <span className="ml-1 font-medium text-red-600">
                                {session.wrong_answers}
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Session Details */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">Detail Tryout</h2>
                  {!selectedSession ? (
                    <Card>
                      <CardContent className="p-8 text-center">
                        <p className="text-gray-600">Pilih tryout untuk melihat detail</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {packages[selectedSession.package_id]?.title || 'Paket Tidak Diketahui'}
                        </CardTitle>
                        <CardDescription>
                          {new Date(selectedSession.created_at).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedSession.status === 'completed' ? (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-blue-50 rounded-lg">
                                <div className={`text-2xl font-bold ${getScoreColor(selectedSession.total_score)}`}>
                                  {selectedSession.total_score}
                                </div>
                                <div className="text-sm text-gray-600">Skor Total</div>
                              </div>
                              <div className="text-center p-4 bg-green-50 rounded-lg">
                                <div className="text-2xl font-bold text-green-600">
                                  {selectedSession.correct_answers}
                                </div>
                                <div className="text-sm text-gray-600">Jawaban Benar</div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="text-center p-4 bg-red-50 rounded-lg">
                                <div className="text-2xl font-bold text-red-600">
                                  {selectedSession.wrong_answers}
                                </div>
                                <div className="text-sm text-gray-600">Jawaban Salah</div>
                              </div>
                              <div className="text-center p-4 bg-gray-50 rounded-lg">
                                <div className="text-2xl font-bold text-gray-600">
                                  {selectedSession.unanswered}
                                </div>
                                <div className="text-sm text-gray-600">Tidak Dijawab</div>
                              </div>
                            </div>

                            {selectedSession.start_time && selectedSession.end_time && (
                              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                                <div className="text-lg font-bold text-yellow-600">
                                  {Math.round((new Date(selectedSession.end_time) - new Date(selectedSession.start_time)) / (1000 * 60))} menit
                                </div>
                                <div className="text-sm text-gray-600">Waktu Pengerjaan</div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-center p-8">
                            <Badge variant="secondary" className="mb-2">Tryout Berlangsung</Badge>
                            <p className="text-gray-600">Tryout masih dalam proses pengerjaan</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="statistics">
            {!stats ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">Belum ada data statistik</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Tryout</CardTitle>
                    <Trophy className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSessions}</div>
                    <p className="text-xs text-muted-foreground">Tryout selesai</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rata-rata Skor</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}>
                      {stats.averageScore}
                    </div>
                    <p className="text-xs text-muted-foreground">Dari semua tryout</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Skor Tertinggi</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(stats.highestScore)}`}>
                      {stats.highestScore}
                    </div>
                    <p className="text-xs text-muted-foreground">Pencapaian terbaik</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Akurasi</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${getScoreColor(stats.accuracy)}`}>
                      {stats.accuracy}%
                    </div>
                    <p className="text-xs text-muted-foreground">Jawaban benar</p>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HistoryPage;