import { bulkUpsertProducts } from "@/api/product-api";
import { getProductTasks } from "@/api/product-api";
import ResoucesUpload from "@/components/layout/modal/resourcesUpload";
import ProductEditModal from "@/components/layout/modal/productEdit";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToken } from "@/stores/account-store";
import { useResourcesStore } from "@/stores/resources-store";
import { FileInput, MoreHorizontalIcon, Save } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResourcesPage() {
  const [modal, setModal] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);

  const [tasksMap, setTasksMap] = useState({});

  const [editingProduct, setEditingProduct] = useState(null);
  const [editOpen, setEditOpen] = useState(false);

  const token = useToken((state) => state.token);
  const { products, loading, fetchProducts } = useResourcesStore();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  /* ================= 저장 ================= */

  const handleFinalSave = async () => {
    if (pendingProducts.length === 0) return;

    await bulkUpsertProducts([...products, ...pendingProducts], token);

    setPendingProducts([]);
    fetchProducts();
  };

  /* ================= 공정 불러오기 ================= */

  const loadTasks = async (productId) => {
    if (tasksMap[productId]) return;

    const data = await getProductTasks(productId, token);

    setTasksMap((prev) => ({
      ...prev,
      [productId]: data.tasks || [],
    }));
  };

  const gridCols = "grid grid-cols-[15%_40%_30%_15%] w-full items-center";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-stone-600">자료실</h1>

      <div className="rounded-lg border bg-white shadow-sm">
        {/* ================= ACTION BAR ================= */}

        <div className="flex justify-end gap-2 px-4 py-3 border-b bg-white">
          <Button
            size="sm"
            onClick={() => setModal(true)}
            className="bg-indigo-900 hover:bg-indigo-500"
          >
            파일 추가
            <FileInput className="ml-1 h-4 w-4" />
          </Button>

          <Button
            size="sm"
            onClick={handleFinalSave}
            disabled={pendingProducts.length === 0}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50"
          >
            저장
            <Save className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* ================= HEADER ================= */}

        <div className="border-b bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
          <div className={gridCols}>
            <div>제품명</div>
            <div>설명</div>
            <div>업로드 날짜</div>
            <div className="text-center">설정</div>
          </div>
        </div>

        {/* ================= PRODUCT LIST ================= */}

        <Accordion type="multiple" className="w-full">
          {loading && (
            <div className="py-6 text-center text-muted-foreground">
              불러오는 중...
            </div>
          )}

          {!loading &&
            products.map((product) => (
              <AccordionItem
                key={product.id}
                value={product.id}
                className="border-b"
              >
                <AccordionTrigger className="px-4 py-2 hover:bg-stone-50 transition">
                  <div
                    className={gridCols}
                    onClick={() => loadTasks(product.id)}
                  >
                    <div className="font-medium truncate">{product.name}</div>

                    <div className="truncate text-muted-foreground pl-4">
                      {product.description}
                    </div>

                    <div className="pl-4">
                      {product.createdAt?.slice(0, 10)}
                    </div>

                    {/* ===== ACTION MENU ===== */}
                    <div
                      className="text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingProduct(product);
                              setEditOpen(true);
                            }}
                          >
                            수정
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={async () => {
                              const filtered = products.filter(
                                (p) => p.id !== product.id,
                              );

                              await bulkUpsertProducts(filtered, token);
                              fetchProducts();
                            }}
                          >
                            삭제
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </AccordionTrigger>

                {/* ================= TASK AREA ================= */}

                <AccordionContent className="bg-stone-50 px-6 py-4 space-y-2">
                  {!tasksMap[product.id] && (
                    <div className="text-sm text-muted-foreground">
                      공정 불러오는 중...
                    </div>
                  )}

                  {tasksMap[product.id]?.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between rounded-md border bg-white px-4 py-2 text-sm hover:bg-stone-50 transition"
                    >
                      <div>
                        <div className="font-medium">
                          {task.seq}. {task.name}
                        </div>
                        <div className="text-muted-foreground">
                          {task.description}
                        </div>
                      </div>

                      <div className="text-right text-xs text-stone-500">
                        <div>{task.toolCategory.name}</div>
                        <div>{task.duration}분</div>
                      </div>
                    </div>
                  ))}

                  {tasksMap[product.id]?.length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      등록된 공정 없음
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      </div>

      {/* ================= UPLOAD MODAL ================= */}

      <ResoucesUpload
        open={modal}
        onClose={() => setModal(false)}
        onAddPending={(list) =>
          setPendingProducts((prev) => [...prev, ...list])
        }
      />

      {/* ================= EDIT MODAL ================= */}

      <ProductEditModal
        open={editOpen}
        product={editingProduct}
        onClose={() => setEditOpen(false)}
        onSaved={async (data) => {
          const updated = products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...data } : p,
          );

          await bulkUpsertProducts(updated, token);
          fetchProducts();
          setEditOpen(false);
        }}
      />
    </div>
  );
}
