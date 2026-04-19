import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Product, ProductCategory } from "../../types";
import { ImagePlus, X } from "lucide-react";
import { toast } from "sonner";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null; // Pass null for new product
  onSave?: (product: Partial<Product>) => void;
}

const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: "Food & Groceries", value: "food" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Home & Garden", value: "home" },
  { label: "Gifts & Flowers", value: "gifts" },
  { label: "Other", value: "other" },
];

export function ProductModal({ isOpen, onClose, product, onSave }: ProductModalProps) {
  const isEditing = !!product;

  const [formData, setFormData] = useState<Partial<Product>>({
    title: "",
    description: "",
    price_zmw: 0,
    stock_count: 0,
    category: "food",
    images: [],
    featured: false,
  });

  useEffect(() => {
    if (isOpen) {
      if (product) {
        setFormData(product);
      } else {
        setFormData({
          title: "",
          description: "",
          price_zmw: 0,
          stock_count: 0,
          category: "food",
          images: [],
          featured: false,
        });
      }
    }
  }, [isOpen, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      category: value as ProductCategory,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.price_zmw || formData.price_zmw <= 0) {
      toast.error("Please fill in the required fields correctly.");
      return;
    }

    if (onSave) {
      onSave(formData);
    }
    toast.success(isEditing ? "Product updated successfully!" : "Product created successfully!");
    onClose();
  };

  // Mock adding an image URL
  const handleAddImage = () => {
    // Generate a random image from Unsplash for prototyping
    const randomImageUrl = `https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80&auto=format&fit=crop`;
    setFormData((prev) => ({
      ...prev,
      images: [...(prev.images || []), randomImageUrl],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-light">{isEditing ? "Edit Product" : "Add New Product"}</DialogTitle>
          <DialogDescription className="font-light">
            Fill in the details for this item. Buyers will see this in your catalog.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-xs font-light text-muted-foreground">Product Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Premium Chocolate Cake"
                className="mt-1 font-light"
                required
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-xs font-light text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your product..."
                className="mt-1 resize-none h-24 font-light"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price_zmw" className="text-xs font-light text-muted-foreground">Price (ZMW) *</Label>
                <Input
                  id="price_zmw"
                  name="price_zmw"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.price_zmw}
                  onChange={handleChange}
                  className="mt-1 font-light"
                  required
                />
              </div>
              <div>
                <Label htmlFor="stock_count" className="text-xs font-light text-muted-foreground">Stock Count</Label>
                <Input
                  id="stock_count"
                  name="stock_count"
                  type="number"
                  min="0"
                  value={formData.stock_count}
                  onChange={handleChange}
                  className="mt-1 font-light"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category" className="text-xs font-light text-muted-foreground">Category</Label>
              <Select value={formData.category} onValueChange={handleSelectChange}>
                <SelectTrigger className="mt-1 font-light">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value} className="font-light">
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs font-light text-muted-foreground mb-2 block">Product Images</Label>
              <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                {formData.images?.map((url, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg border border-border overflow-hidden flex-shrink-0 group">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={handleAddImage}
                  className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center text-muted-foreground hover:bg-gray-50 transition-colors flex-shrink-0"
                >
                  <ImagePlus className="w-5 h-5 mb-1" />
                  <span className="text-[10px]">Add</span>
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="font-light rounded-xl">
              Cancel
            </Button>
            <Button type="submit" className="font-light rounded-xl bg-slate-900 text-white hover:bg-slate-800">
              {isEditing ? "Save Changes" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
