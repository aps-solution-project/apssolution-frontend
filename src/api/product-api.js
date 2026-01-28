const URL = "http://192.168.0.20:8080";
//파일 업로드 api
async function upLoadFiles(file, token) {
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
async function bulkUpsertProducts(products, token) {
  const payload = {
    products: products.map((p) => ({
      id: p.id, // 기존이면 수정
      toolId: p.toolId, // 공정 장비 기준
      categoryId: p.categoryId,
      description: p.description,
      name: p.name,
    })),
  };

  const resp = await fetch(`${URL}/api/products`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!resp.ok) throw new Error("제품 저장 실패");

  return resp.json();
}

//품목 파일 전체조회 api
const getProducts = async (token) => {
  if (!token) throw new Error("No token");
  const response = await fetch(`${URL}/api/products`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("상품 목록 조회에 실패했습니다.");
  }

  return response.json();
};

async function getProduct(token, productId) {
  const resp = await fetch(`${URL}/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("상품 조회에 실패했습니다.");
  }
  return resp.json();
}

async function getProductTasks(productId, token) {
  const resp = await fetch(`${URL}/api/products/${productId}/tasks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!resp.ok) {
    throw new Error("상품 작업 조회에 실패했습니다.");
  }
  return resp.json();
}

export {
  bulkUpsertProducts,
  getProduct,
  getProducts,
  getProductTasks,
  upLoadFiles,
};
