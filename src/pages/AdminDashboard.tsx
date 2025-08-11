import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { QuestionPackage, Question, PaymentSetting } from "@/entities";
import { toast } from "@/hooks/use-toast";
import PackageForm from "@/components/PackageForm";
import QuestionForm from "@/components/QuestionForm";
import PaymentSettings from "@/components/PaymentSettings";

const AdminDashboard = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [showPackageForm, setShowPackageForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  useEffect(() => {
    if (selectedPackage) {
      loadQuestions(selectedPackage.id);
    }
  }, [selectedPackage]);

  const loadPackages = async () => {
    try {
      const packageList = await QuestionPackage.list('-created_at', 50);
      setPackages(packageList);
    } catch (error) {
      console.error("Error loading packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (packageId) => {
    try {
      const questionList = await Question.filter({ package_id: packageId }, 'question_number', 100);
      setQuestions(questionList);
    } catch (error) {
      console.error("Error loading questions:", error);
    }
  };

  const handleDeletePackage = async (packageId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus paket ini?")) return;
    
    try {
      await QuestionPackage.delete(packageId);
      toast({
        title: "Berhasil",
        description: "Paket soal berhasil dihapus",
      });
      loadPackages();
      if (selectedPackage?.id === packageId) {
        setSelectedPackage(null);
        setQuestions([]);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus paket soal",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm("Apakah Anda yakin ingin menghapus soal ini?")) return;
    
    try {
      await Question.delete(questionId);
      toast({
        title: "Berhasil",
        description: "Soal berhasil dihapus",
      });
      loadQuestions(selectedPackage.id);
      
      // Update package total questions count
      const updatedCount = questions.length - 1;
      await QuestionPackage.update(selectedPackage.id, { total_questions: updatedCount });
      loadPackages();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menghapus soal",
        variant: "destructive",
      });
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
            <div className="flex items-center space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Kelola paket soal dan pengaturan sistem</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="packages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="packages">Paket Soal</TabsTrigger>
            <TabsTrigger value="questions">Kelola Soal</TabsTrigger>
            <TabsTrigger value="payments">Pengaturan Pembayaran</TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Paket Soal</h2>
              <Button onClick={() => setShowPackageForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Paket
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg">{pkg.title}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
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
                      <div className="flex justify-between text-sm">
                        <span>Harga:</span>
                        <span className="font-medium">
                          {pkg.requires_payment ? `Rp ${pkg.price?.toLocaleString('id-ID')}` : 'Gratis'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setEditingPackage(pkg);
                          setShowPackageForm(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedPackage(pkg)}
                      >
                        Kelola Soal
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeletePackage(pkg.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="space-y-6">
            {!selectedPackage ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-gray-600">Pilih paket soal terlebih dahulu untuk mengelola soal</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold">Soal - {selectedPackage.title}</h2>
                    <p className="text-gray-600">{questions.length} soal</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedPackage(null)}
                    >
                      Kembali ke Paket
                    </Button>
                    <Button onClick={() => setShowQuestionForm(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Soal
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <Card key={question.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-medium mb-2">
                              {index + 1}. {question.question_text}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                              <div>A. {question.option_a}</div>
                              <div>B. {question.option_b}</div>
                              <div>C. {question.option_c}</div>
                              <div>D. {question.option_d}</div>
                              <div>E. {question.option_e}</div>
                            </div>
                            <p className="text-sm text-green-600 mt-2">
                              Jawaban: {question.correct_answer}
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setEditingQuestion(question);
                                setShowQuestionForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="payments">
            <PaymentSettings />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      {showPackageForm && (
        <PackageForm
          package={editingPackage}
          onClose={() => {
            setShowPackageForm(false);
            setEditingPackage(null);
          }}
          onSave={() => {
            loadPackages();
            setShowPackageForm(false);
            setEditingPackage(null);
          }}
        />
      )}

      {showQuestionForm && selectedPackage && (
        <QuestionForm
          packageId={selectedPackage.id}
          question={editingQuestion}
          questionNumber={questions.length + 1}
          onClose={() => {
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
          onSave={() => {
            loadQuestions(selectedPackage.id);
            loadPackages(); // Refresh to update question count
            setShowQuestionForm(false);
            setEditingQuestion(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;