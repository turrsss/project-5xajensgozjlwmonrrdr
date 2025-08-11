import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, ArrowLeft, ArrowRight, Flag } from "lucide-react";
import { QuestionPackage, Question, TryoutSession, UserAnswer, QuestionTagStats } from "@/entities";
import { toast } from "@/hooks/use-toast";

const TryoutPage = () => {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const [packageData, setPackageData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [session, setSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [questionTimes, setQuestionTimes] = useState({});
  const intervalRef = useRef(null);

  useEffect(() => {
    initializeTryout();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [packageId]);

  useEffect(() => {
    if (timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [timeLeft]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const initializeTryout = async () => {
    try {
      const [pkg, questionList] = await Promise.all([
        QuestionPackage.get(packageId),
        Question.filter({ package_id: packageId }, 'question_number', 200)
      ]);
      
      setPackageData(pkg);
      setQuestions(questionList);
      
      // Create new session
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const newSession = await TryoutSession.create({
        user_id: currentUser.id,
        package_id: packageId,
        start_time: new Date().toISOString(),
        status: 'in_progress'
      });
      
      setSession(newSession);
      setTimeLeft(pkg.duration_minutes * 60); // Convert to seconds
      
    } catch (error) {
      console.error("Error initializing tryout:", error);
      toast({
        title: "Error",
        description: "Gagal memulai tryout",
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = async (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));

    // Store time spent on this question
    setQuestionTimes(prev => ({
      ...prev,
      [currentQuestion.id]: timeSpent
    }));

    // Save answer to database
    try {
      const existingAnswers = await UserAnswer.filter({
        session_id: session.id,
        question_id: currentQuestion.id
      });

      const answerData = {
        session_id: session.id,
        question_id: currentQuestion.id,
        user_answer: answer,
        is_correct: answer === currentQuestion.correct_answer,
        time_spent_seconds: timeSpent
      };

      if (existingAnswers.length > 0) {
        await UserAnswer.update(existingAnswers[0].id, answerData);
      } else {
        await UserAnswer.create(answerData);
      }
    } catch (error) {
      console.error("Error saving answer:", error);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateTagStats = async (userAnswers) => {
    const tagStats = {};
    
    // Group questions by main and sub category
    questions.forEach(question => {
      const mainCat = question.main_category || 'Non Tag';
      const subCat = question.sub_category || 'Umum';
      const key = `${mainCat}|${subCat}`;
      
      if (!tagStats[key]) {
        tagStats[key] = {
          main_category: mainCat,
          sub_category: subCat,
          total_questions: 0,
          correct_answers: 0,
          wrong_answers: 0,
          unanswered: 0,
          total_time_seconds: 0
        };
      }
      tagStats[key].total_questions++;
    });

    // Calculate stats for each category combination
    userAnswers.forEach(answer => {
      const question = questions.find(q => q.id === answer.question_id);
      if (question) {
        const mainCat = question.main_category || 'Non Tag';
        const subCat = question.sub_category || 'Umum';
        const key = `${mainCat}|${subCat}`;
        
        if (answer.is_correct) {
          tagStats[key].correct_answers++;
        } else if (answer.user_answer) {
          tagStats[key].wrong_answers++;
        } else {
          tagStats[key].unanswered++;
        }
        
        tagStats[key].total_time_seconds += answer.time_spent_seconds || 0;
      }
    });

    // Save tag stats to database
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    for (const [key, stats] of Object.entries(tagStats)) {
      try {
        await QuestionTagStats.create({
          session_id: session.id,
          user_id: currentUser.id,
          package_id: packageId,
          main_category: stats.main_category,
          sub_category: stats.sub_category,
          total_questions: stats.total_questions,
          correct_answers: stats.correct_answers,
          wrong_answers: stats.wrong_answers,
          unanswered: stats.unanswered,
          total_time_seconds: stats.total_time_seconds,
          average_time_seconds: stats.total_questions > 0 ? Math.round(stats.total_time_seconds / stats.total_questions) : 0
        });
      } catch (error) {
        console.error(`Error saving tag stats for ${key}:`, error);
      }
    }
  };

  const handleFinishTryout = async () => {
    if (!confirm("Apakah Anda yakin ingin menyelesaikan tryout?")) return;
    
    try {
      // Calculate results
      const userAnswers = await UserAnswer.filter({ session_id: session.id });
      const correctAnswers = userAnswers.filter(answer => answer.is_correct).length;
      const wrongAnswers = userAnswers.filter(answer => !answer.is_correct && answer.user_answer).length;
      const unanswered = questions.length - userAnswers.length;
      const totalScore = Math.round((correctAnswers / questions.length) * 100);

      // Calculate tag statistics
      await calculateTagStats(userAnswers);

      // Update session
      await TryoutSession.update(session.id, {
        end_time: new Date().toISOString(),
        status: 'completed',
        total_score: totalScore,
        correct_answers: correctAnswers,
        wrong_answers: wrongAnswers,
        unanswered: unanswered
      });

      toast({
        title: "Tryout selesai",
        description: `Skor Anda: ${totalScore}`,
      });

      navigate(`/history`);
    } catch (error) {
      console.error("Error finishing tryout:", error);
      toast({
        title: "Error",
        description: "Gagal menyelesaikan tryout",
        variant: "destructive",
      });
    }
  };

  const handleTimeUp = async () => {
    toast({
      title: "Waktu habis",
      description: "Tryout akan diselesaikan otomatis",
      variant: "destructive",
    });
    
    setTimeout(() => {
      handleFinishTryout();
    }, 2000);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return Object.keys(answers).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!packageData || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Paket soal tidak ditemukan atau belum ada soal</p>
            <Button className="mt-4" onClick={() => navigate('/dashboard')}>
              Kembali ke Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900">{packageData.title}</h1>
              <Badge variant="secondary">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </Badge>
              {currentQuestion.main_category && (
                <Badge variant="outline">
                  {currentQuestion.main_category}
                </Badge>
              )}
              {currentQuestion.sub_category && (
                <Badge variant="outline" className="bg-blue-50">
                  {currentQuestion.sub_category}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-orange-600">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-mono font-bold text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <Button variant="destructive" onClick={handleFinishTryout}>
                <Flag className="w-4 h-4 mr-2" />
                Selesai
              </Button>
            </div>
          </div>
          
          <div className="pb-2">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Progress: {Math.round(progress)}%</span>
              <span>Terjawab: {getAnsweredCount()}/{questions.length}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm">Navigasi Soal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((question, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant={
                        index === currentQuestionIndex ? "default" :
                        answers[question.id] ? "secondary" : "outline"
                      }
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentQuestionIndex(index)}
                      title={`${question.main_category || 'Non Tag'} - ${question.sub_category || 'Umum'}`}
                    >
                      {index + 1}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Soal {currentQuestionIndex + 1}</span>
                  <div className="flex space-x-2">
                    {currentQuestion.main_category && (
                      <Badge variant="secondary">
                        {currentQuestion.main_category}
                      </Badge>
                    )}
                    {currentQuestion.sub_category && (
                      <Badge variant="outline" className="bg-blue-50">
                        {currentQuestion.sub_category}
                      </Badge>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="prose max-w-none">
                  <p className="text-gray-800 leading-relaxed">
                    {currentQuestion.question_text}
                  </p>
                </div>

                <div className="space-y-3">
                  {['A', 'B', 'C', 'D', 'E'].map((option) => (
                    <div
                      key={option}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        answers[currentQuestion.id] === option
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                      onClick={() => handleAnswerSelect(option)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium ${
                          answers[currentQuestion.id] === option
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300'
                        }`}>
                          {option}
                        </div>
                        <p className="text-gray-800 flex-1">
                          {currentQuestion[`option_${option.toLowerCase()}`]}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Sebelumnya
                  </Button>
                  
                  <Button
                    onClick={handleNextQuestion}
                    disabled={currentQuestionIndex === questions.length - 1}
                  >
                    Selanjutnya
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TryoutPage;