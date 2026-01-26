import { upLoadFiles } from "@/api/page-api";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToken } from "@/stores/account-store";
import { CheckCircle2, FileSpreadsheet, Save, Upload } from "lucide-react";
import { useRef, useState } from "react";
import * as XLSX from "xlsx";

const message = ["레시피를 업로드해주세요"];

export default function ResoucesUpload({ open, onClose, onAddPending }) {
  const fileInputRef = useRef(null);
  const token = useToken((state) => state.token);

  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [columns, setColumns] = useState([]);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState(false);

  const isExcelFile = (file) =>
    file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    file.type === "application/vnd.ms-excel";

  const handleFile = async (selectedFile) => {
    if (!isExcelFile(selectedFile)) {
      setError("엑셀 파일(.xls, .xlsx)만 업로드 가능합니다.");
      setUploadError(true);
      setTimeout(() => setUploadError(false), 800);
      return;
    }

    setError("");
    setUploadError(false);
    setFile(selectedFile);
    setProgress(20);

    const data = await selectedFile.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    setColumns(json[0] || []);
    setProgress(60);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSave = async () => {
    if (!file) {
      setError("파일을 업로드해주세요.");
      setUploadError(true);
      return;
    }

    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    try {
      setProgress(80);

      const parsed = await upLoadFiles(file, token);

      onAddPending(parsed.products);

      setProgress(100);

      setTimeout(() => {
        onClose();
        reset();
      }, 400);
    } catch (e) {
      setError(e.message);
      setUploadError(true);
    }
  };

  const reset = () => {
    setFile(null);
    setProgress(0);
    setColumns([]);
    setError("");
    setUploadError(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-120 rounded-2xl">
        <DialogHeader>
          <DialogTitle>
            <p className="text-stone-600">파일 추가</p>
          </DialogTitle>
        </DialogHeader>

        <div
          onClick={() => fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition
            ${
              uploadError
                ? "border-red-400 bg-red-50 animate-shake"
                : file
                  ? "border-emerald-400 bg-emerald-50/40"
                  : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/40"
            }
          `}
        >
          <div className="flex justify-center mb-3">
            {file ? (
              <CheckCircle2 className="text-emerald-500" size={32} />
            ) : (
              <Upload className="text-gray-400" size={32} />
            )}
          </div>

          <p className="font-medium">
            {file ? "파일이 등록되었습니다" : "드래그하거나 클릭해서 업로드"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            .xls, .xlsx 파일만 가능
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".xls,.xlsx"
            className="hidden"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm font-medium text-red-500">{error}</p>
        )}

        {file && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border bg-muted px-4 py-3">
            <FileSpreadsheet className="text-emerald-600" size={20} />
            <span className="truncate text-sm font-medium">{file.name}</span>
          </div>
        )}

        {progress > 0 && <Progress value={progress} className="mt-4" />}

        {columns.length > 0 && (
          <div className="mt-4">
            <div className="flex flex-wrap gap-2">
              {message.map((col) => (
                <Badge
                  key={col}
                  className="bg-gray-100 text-gray-600 hover:bg-gray-100"
                >
                  {col}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={() => {
              onClose();
              reset();
            }}
            className="rounded-lg px-4 py-2 text-sm hover:bg-muted"
          >
            취소
          </button>

          <button
            onClick={handleSave}
            className="
              flex items-center gap-2
              rounded-lg bg-indigo-800 px-4 py-2
              text-sm font-medium text-white
              hover:bg-indigo-500
              whitespace-nowrap
            "
          >
            파일 추가
            <Save className="h-4 w-4" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
