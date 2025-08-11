import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QuestionPackage } from "@/entities";
import { toast } from "@/hooks/use-toast";

const PackageForm = ({ package: editPackage, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration_minutes: 110,
    price: 0,
    requires_payment: true,
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editPackage) {
      setFormData({
        title: editPackage.title || "",
        description: editPackage.description || "",
        duration_minutes: editPackage.duration_minutes || 110,
        price: editPackage.price || 0,
        requires_payment: editPackage.requires_payment ?? true,
        is_active: editPackage.is_active ?? true,
      });
    }
  }, [editPackage]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSwitchChange = (name, checked) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editPackage) {
        await QuestionPackage.update(editPackage.id, formData);
        toast({
          title: "Berhasil",
          description: "Paket soal berhasil diperbarui",
        });
      } else {
        await QuestionPackage.create({
          ...formData,
          total_questions: 0
        });
        toast({
          title: "Berhasil",
          description: "Paket soal berhasil dibuat",
        });
      }
      onSave();
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyimpan paket soal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editPackage ? "Edit Paket Soal" : "Tambah Paket Soal"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul Paket</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Masukkan judul paket"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Masukkan deskripsi paket"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration_minutes">Durasi (menit)</Label>
            <Input
              id="duration_minutes"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="requires_payment"
              checked={formData.requires_payment}
              onCheckedChange={(checked) => handleSwitchChange('requires_payment', checked)}
            />
            <Label htmlFor="requires_payment">Memerlukan Pembayaran</Label>
          </div>

          {formData.requires_payment && (
            <div className="space-y-2">
              <Label htmlFor="price">Harga (Rupiah)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleSwitchChange('is_active', checked)}
            />
            <Label htmlFor="is_active">Aktif</Label>
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

export default PackageForm;