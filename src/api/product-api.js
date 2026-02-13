//파일 업로드 api
async function upLoadFiles(file, token) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/products/xls/parse`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Error");
  }

  return response.json();
}

//파일 저장 api
async function bulkUpsertProducts(data, token) {
  // 이미 handleSaveAll에서 productId 등으로 매핑된 배열을 받으므로 그대로 payload에 넣습니다.
  const payload = {
    products: data,
  };

  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/products`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );

  if (!resp.ok) {
    const errorData = await resp.json();
    throw new Error(errorData.message || "제품 저장 실패");
  }

  return resp.json();
}

//품목 파일 전체조회 api
const getProducts = async (token) => {
  if (!token) throw new Error("No token");
  const response = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/products`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("상품 목록 조회에 실패했습니다.");
  }

  return response.json();
};

async function getProduct(token, productId) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/products/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!resp.ok) {
    throw new Error("상품 조회에 실패했습니다.");
  }
  return resp.json();
}

async function getProductTasks(productId, token) {
  const resp = await fetch(
    `http://${process.env.NEXT_PUBLIC_APS_SURVER_ADDRESS}:8080/api/products/${productId}/tasks`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
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
