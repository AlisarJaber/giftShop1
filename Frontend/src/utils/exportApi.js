import { http } from "./http";

export async function downloadProductsPdf() {
  const res = await http.get("/export/products-pdf", {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement("a");
  a.href = url;
  a.download = "products_inventory.pdf";
  document.body.appendChild(a);
  a.click();
  a.remove();
}
