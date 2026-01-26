const URL = "http://192.168.0.17:8080";
//파일 업로드 api
export async function upLoadFiles(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${URL}/api/products/xls/parse`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error");
  }

  return response.json();
}

//파일 저장 api
export async function bulkUpsertProducts(products, token) {
  const response = await fetch(`${URL}/api/products`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      products: products.map((p) => ({
        productId: p.id,
        name: p.name,
        description: p.description,
        created_at: p.created_at,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Bulk upsert failed");
  }

  return response.json();
}

//품목 파일 전체조회 api
export const getProducts = async (token) => {
  if (!token) throw new Error("No token");
  const response = await fetch(`${URL}/api/products`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("상품 목록 조회에 실패했습니다.");
  }

  return response.json();
};
