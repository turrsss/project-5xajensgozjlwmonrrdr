import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Clock, Trophy, Users, CheckCircle, Star } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">SKD CPNS Tryout</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button>Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4" variant="secondary">
            Platform Tryout SKD CPNS Terpercaya
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Persiapkan Diri untuk
            <span className="text-blue-600 block">SKD CPNS 2024</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Platform tryout online terlengkap dengan soal-soal berkualitas, 
            sistem penilaian akurat, dan analisis mendalam untuk membantu Anda 
            lolos seleksi CPNS.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto">
                Mulai Tryout Gratis
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Masuk ke Akun
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Platform Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fitur-fitur unggulan yang dirancang khusus untuk membantu Anda 
              sukses dalam seleksi SKD CPNS
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Clock className="w-12 h-12 text-blue-600 mb-4" />
                <CardTitle>Timer Realistis</CardTitle>
                <CardDescription>
                  Simulasi waktu pengerjaan yang sama dengan tes sesungguhnya (110 menit)
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Trophy className="w-12 h-12 text-green-600 mb-4" />
                <CardTitle>Analisis Mendalam</CardTitle>
                <CardDescription>
                  Dapatkan analisis detail hasil tryout dengan statistik lengkap
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="w-12 h-12 text-purple-600 mb-4" />
                <CardTitle>Bank Soal Lengkap</CardTitle>
                <CardDescription>
                  Ribuan soal berkualitas yang disusun sesuai kisi-kisi SKD terbaru
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="w-12 h-12 text-orange-600 mb-4" />
                <CardTitle>Pembahasan Detail</CardTitle>
                <CardDescription>
                  Setiap soal dilengkapi dengan pembahasan yang mudah dipahami
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CheckCircle className="w-12 h-12 text-teal-600 mb-4" />
                <CardTitle>Riwayat Lengkap</CardTitle>
                <CardDescription>
                  Pantau progress belajar dengan riwayat tryout yang tersimpan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Star className="w-12 h-12 text-yellow-600 mb-4" />
                <CardTitle>Interface Mudah</CardTitle>
                <CardDescription>
                  Antarmuka yang user-friendly dan mudah digunakan untuk semua kalangan
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">10,000+</div>
              <div className="text-gray-600">Soal Berkualitas</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-green-600 mb-2">5,000+</div>
              <div className="text-gray-600">Pengguna Aktif</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600 mb-2">85%</div>
              <div className="text-gray-600">Tingkat Kelulusan</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Persiapan SKD CPNS?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Bergabunglah dengan ribuan peserta lainnya dan tingkatkan peluang 
            kelulusan Anda dengan tryout berkualitas tinggi.
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Daftar Sekarang - Gratis!
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-8 h-8 text-blue-400" />
                <h3 className="text-xl font-bold">SKD CPNS Tryout</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Platform tryout online terpercaya untuk persiapan SKD CPNS. 
                Dilengkapi dengan soal berkualitas dan analisis mendalam.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Fitur</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Tryout Online</li>
                <li>Bank Soal</li>
                <li>Analisis Hasil</li>
                <li>Riwayat Tryout</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Panduan Penggunaan</li>
                <li>FAQ</li>
                <li>Kontak Support</li>
                <li>Kebijakan Privasi</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SKD CPNS Tryout. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;