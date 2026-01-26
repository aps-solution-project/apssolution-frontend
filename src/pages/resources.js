import { bulkUpsertProducts } from "@/api/page-api";
import ResoucesUpload from "@/components/layout/modal/resourcesUpload";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToken } from "@/stores/account-store";
import { useResourcesStore } from "@/stores/resources-store";
import { FileInput, MoreHorizontalIcon, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResourcesPage() {
  const [modal, setModal] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);

  const token = useToken((state) => state.token);
  const { products, loading, fetchProducts } = useResourcesStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // 저장 버튼
  const handleFinalSave = async () => {
    if (pendingProducts.length === 0) return;

    try {
      await bulkUpsertProducts([...products, ...pendingProducts], token);

      setPendingProducts([]);
      fetchProducts();
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">자료실</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            레시피 자료를 확인할 수 있습니다.
          </p>

          <div className="flex gap-2">
            <Button
              onClick={() => setModal(true)}
              className="bg-indigo-900 hover:bg-indigo-500"
            >
              파일 추가
              <FileInput className="ml-2 h-4 w-4" />
            </Button>

            <Button
              onClick={handleFinalSave}
              disabled={pendingProducts.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
            >
              저장
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        <Table className="table-fixed w-full">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[15%]">제품명</TableHead>
              <TableHead className="w-[40%]">설명</TableHead>
              <TableHead className="w-[30%]">업로드 날짜</TableHead>
              <TableHead className="w-[15%] text-center">설정</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            )}

            {/* 저장 대기 데이터 */}
            {pendingProducts.map((product, idx) => (
              <TableRow key={`pending-${idx}`} className="bg-emerald-50">
                <TableCell className="font-medium truncate">
                  {product.name}
                </TableCell>

                <TableCell className="text-muted-foreground truncate">
                  {product.description}
                </TableCell>

                <TableCell className="text-emerald-700 font-medium">
                  저장 대기
                </TableCell>

                <TableCell className="text-center text-emerald-600">
                  신규
                </TableCell>
              </TableRow>
            ))}

            {/* 기존 데이터 */}
            {!loading &&
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium truncate">
                    {product.name}
                  </TableCell>

                  <TableCell className="text-muted-foreground truncate">
                    {product.description}
                  </TableCell>

                  <TableCell>{product.createdAt?.slice(0, 10)}</TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8">
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>수정</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant="destructive">
                          삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      <ResoucesUpload
        open={modal}
        onClose={() => setModal(false)}
        onAddPending={(list) =>
          setPendingProducts((prev) => [...prev, ...list])
        }
      />
    </div>
  );
}
