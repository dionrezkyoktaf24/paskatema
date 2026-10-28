export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  /** null = stok tidak dibatasi. */
  stock: number | null;
  options: string[];
  isActive: boolean;
  image: { id: string; url: string; mimeType: string; fileName: string } | null;
}
