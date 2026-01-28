import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";

export default function ProductEditModal({ open, product, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
      });
    }
  }, [product]);

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm space-y-4">
        <DialogHeader>
          <DialogTitle>제품 수정</DialogTitle>
        </DialogHeader>

        <Input
          placeholder="제품명"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        <Input
          placeholder="설명"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button
            className="bg-indigo-900 hover:bg-indigo-500"
            onClick={() => onSaved(form)}
          >
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
