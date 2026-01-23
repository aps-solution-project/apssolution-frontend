import { useEffect, useState } from "react";
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
import { FileInput, MoreHorizontalIcon } from "lucide-react";
import ResoucesUpload from "@/components/layout/modal/resourcesUpload";
import { getProducts } from "@/api/page-api";

export default function ResourcesPage() {
  const [modal, setModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data.products);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">자료실</h1>

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            레시피 자료를 확인할 수 있습니다.
          </p>

          <Button
            onClick={() => setModal(true)}
            className="bg-indigo-900 hover:bg-indigo-700"
          >
            새 레시피 추가
            <FileInput className="ml-2 h-4 w-4" />
          </Button>
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
                <TableCell colSpan={5} className="text-center">
                  불러오는 중...
                </TableCell>
              </TableRow>
            )}

            {!loading && products.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  등록된 자료가 없습니다.
                </TableCell>
              </TableRow>
            )}

            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium truncate">
                  {product.name}
                </TableCell>

                <TableCell className="text-muted-foreground truncate">
                  {product.description}
                </TableCell>

                <TableCell>{product.createdAt?.slice(0, 10)}</TableCell>

                <TableCell>-</TableCell>

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

      <ResoucesUpload open={modal} onClose={() => setModal(false)} />
    </div>
  );
}
