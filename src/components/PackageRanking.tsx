import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award } from "lucide-react";
import { TryoutSession, User } from "@/entities";

const PackageRanking = ({ packageId, packageTitle, limit = 5 }) => {
  const [topScores, setTopScores] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (packageId) {
      loadRanking();
    }
  }, [packageId]);

  const loadRanking = async () => {
    try {
      const sessions = await TryoutSession.filter(
        { package_id: packageId, status: 'completed' }, 
        '-total_score', 
        limit
      );
      
      setTopScores(sessions);

      // Load user data
      const userIds = [...new Set(sessions.map(s => s.user_id))];
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
      console.error("Error loading ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-600">{index + 1}</div>;
    }
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topScores.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">🏆 Top Ranking</CardTitle>
          <CardDescription className="text-xs">{packageTitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-gray-500 text-center">Belum ada data ranking</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">🏆 Top Ranking</CardTitle>
        <CardDescription className="text-xs">{packageTitle}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {topScores.map((session, index) => (
          <div key={session.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
            <div className="flex items-center space-x-2">
              {getRankIcon(index)}
              <div>
                <p className="text-xs font-medium">
                  {users[session.user_id]?.full_name || 'Unknown'}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(session.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
            <Badge variant={getScoreBadgeVariant(session.total_score)} className="text-xs">
              {session.total_score}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PackageRanking;