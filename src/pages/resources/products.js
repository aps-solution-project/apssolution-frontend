import { getProductTasks } from "@/api/product-api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useResourcesStore } from "@/stores/resources-store";
import { useToken } from "@/stores/account-store";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ResourcesPage() {
  const [tasksMap, setTasksMap] = useState({});

  const token = useToken((state) => state.token);
  const { products, loading, fetchProducts } = useResourcesStore();

  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const loadTasks = async (productId) => {
    if (tasksMap[productId]) return;

    const data = await getProductTasks(productId, token);

    setTasksMap((prev) => ({
      ...prev,
      [productId]: data.tasks || [],
    }));
  };

  const gridCols = "grid grid-cols-[20%_65%_15%] w-full items-center";

  const active = "text-indigo-400 font-semibold";
  const normal = "text-stone-500 hover:text-indigo-600 transition";

  return (
    <div className="space-y-3">
      <Breadcrumb>
        <BreadcrumbList className="text-lg">
          <BreadcrumbItem>
            <Link
              href="/resources/products"
              className={
                router.pathname === "/resources/products" ? active : normal
              }
            >
              품목
            </Link>
          </BreadcrumbItem>

          <BreadcrumbSeparator> | </BreadcrumbSeparator>

          <BreadcrumbItem>
            <Link
              href="/resources/tools"
              className={
                router.pathname === "/resources/tools" ? active : normal
              }
            >
              도구
            </Link>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="rounded-lg border bg-white w-[95%] md:w-[70%] xl:w-[80%] mx-auto shadow-sm">
        <div className="border-b bg-stone-50 px-4 py-2 text-sm font-medium text-stone-600">
          <div className={gridCols}>
            <div>제품명</div>
            <div>설명</div>
            <div>업로드 날짜</div>
          </div>
        </div>

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
                <AccordionTrigger
                  className="px-4 py-6 hover:bg-stone-50 transition"
                  onClick={() => loadTasks(product.id)}
                >
                  <div className={gridCols}>
                    <div className="font-medium truncate">{product.name}</div>

                    <div className="truncate text-muted-foreground pl-4">
                      {product.description}
                    </div>

                    <div className="pl-4">
                      {product.createdAt?.slice(0, 10)}
                    </div>
                  </div>
                </AccordionTrigger>

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
                        <div className="text-right text-xs text-stone-500">
                          <div>{task.toolCategoryId}</div>

                          <div>{task.duration}분</div>
                        </div>
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
    </div>
  );
}
