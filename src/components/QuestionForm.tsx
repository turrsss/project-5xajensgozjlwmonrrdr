import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Question } from "@/entities";
import { toast } from "@/hooks/use-toast";

const QuestionForm = ({ packageId, question: editQuestion, questionNumber, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    option_e: "",
    correct_answer: "",
    explanation: "",
    question_number: questionNumber,
    question_tag: "",
  });
  const [loading, setLoading] = useState(false);

  const questionTags = ["Figural", "Verbal", "Numerik", "Logika", "Penalaran", "Umum"];

  useEffect(() => {
    if (editQuestion) {
      setFormData({
        question_text: editQuestion.question_text || "",
        option_a: editQuestion.option_a || "",
        option_b: editQuestion.option_b || "",
        option_c: editQuestion.option_c || "",
        option_d: editQuestion.option_d || "",
        option_e: editQuestion.option_e || "",
        correct_answer: editQuestion.correct_answer || "",
        explanation: editQuestion.explanation || "",
        question_number: editQuestion.question_number || questionNumber,
        question_tag: editQuestion.question_tag || "",
      });
    }
  }, [editQuestion, questionNumber]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const questionData = {
        ...formData,
        package_id: packageId
      };

      if (editQuestion) {
        await Question.update(editQuestion.id, questionData);
        toast({
          title: "Berhasil",
          description: "Soal berhasil diperbarui",
        });
      } else {
        await Question.create(questionData);
        toast({
          title: "Berhasil",
          description: "Soal berhasil ditambahkan",
        });
      }
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan soal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editQuestion ? "Edit Soal" : "Tambah Soal"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question_text">Pertanyaan</Label>
            <Textarea
              id="question_text"
              name="question_text"
              value={formData.question_text}
              onChange={handleChange}
              placeholder="Masukkan pertanyaan"
              rows={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tag Jenis Soal</Label>
            <Select value={formData.question_tag} onValueChange={(value) => handleSelectChange('question_tag', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jenis soal" />
              </SelectTrigger>
              <SelectContent>
                {questionTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="option_a">Pilihan A</Label>
              <Input
                id="option_a"
                name="option_a"
                value={formData.option_a}
                onChange={handleChange}
                placeholder="Pilihan A"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_b">Pilihan B</Label>
              <Input
                id="option_b"
                name="option_b"
                value={formData.option_b}
                onChange={handleChange}
                placeholder="Pilihan B"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_c">Pilihan C</Label>
              <Input
                id="option_c"
                name="option_c"
                value={formData.option_c}
                onChange={handleChange}
                placeholder="Pilihan C"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_d">Pilihan D</Label>
              <Input
                id="option_d"
                name="option_d"
                value={formData.option_d}
                onChange={handleChange}
                placeholder="Pilihan D"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="option_e">Pilihan E</Label>
              <Input
                id="option_e"
                name="option_e"
                value={formData.option_e}
                onChange={handleChange}
                placeholder="Pilihan E"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Jawaban Benar</Label>
            <Select value={formData.correct_answer} onValueChange={(value) => handleSelectChange('correct_answer', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih jawaban yang benar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
                <SelectItem value="D">D</SelectItem>
                <SelectItem value="E">E</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Penjelasan Jawaban</Label>
            <Textarea
              id="explanation"
              name="explanation"
              value={formData.explanation}
              onChange={handleChange}
              placeholder="Masukkan penjelasan jawaban"
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionForm;