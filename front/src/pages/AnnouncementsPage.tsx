import { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Loader2, 
  Edit,
  Megaphone
} from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context";
import { announcements } from "@/api/adminService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AnnouncementsPage() {
  const { t } = useLanguage();
  const [dataList, setDataList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    text: "",
    link: "",
    order: 0,
    isActive: true,
    isScrollable: true,
  });

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await announcements.getAnnouncements();
      if (res.data.success) {
        setDataList(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch announcements");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (announcement: any = null) => {
    if (announcement) {
      setEditingId(announcement.id);
      setFormData({
        text: announcement.text,
        link: announcement.link || "",
        order: announcement.order || 0,
        isActive: announcement.isActive,
        isScrollable: announcement.isScrollable ?? true,
      });
    } else {
      setEditingId(null);
      setFormData({
        text: "",
        link: "",
        order: dataList.length,
        isActive: true,
        isScrollable: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text) {
      toast.error("Text is required");
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingId) {
        const res = await announcements.updateAnnouncement(editingId, formData);
        if (res.data.success) {
          toast.success("Announcement updated!");
          fetchData();
          handleCloseModal();
        }
      } else {
        const res = await announcements.createAnnouncement(formData);
        if (res.data.success) {
          toast.success("Announcement created!");
          fetchData();
          handleCloseModal();
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save announcement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await announcements.deleteAnnouncement(id);
      if (res.data.success) {
        toast.success("Announcement deleted");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      // Find the item first
      const item = dataList.find((x) => x.id === id);
      if (!item) return;

      const res = await announcements.updateAnnouncement(id, { isActive: !currentStatus });
      if (res.data.success) {
        toast.success(currentStatus ? "Announcement Disabled" : "Announcement Enabled");
        fetchData();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center py-20">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-[#4CAF50]" />
          <p className="mt-4 text-base text-[#9CA3AF]">Loading announcements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-[#1F2937] tracking-tight">
              Announcements
            </h1>
            <p className="text-[#9CA3AF] text-sm mt-1.5">
              Manage the infinite scrolling text bar at the top of the store.
            </p>
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Announcement
          </Button>
        </div>
        <div className="h-px bg-[#E5E7EB]" />
      </div>

      {/* List */}
      {dataList.length === 0 ? (
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl">
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#F3F4F6] mb-4">
              <Megaphone className="h-8 w-8 text-[#9CA3AF]" />
            </div>
            <h3 className="text-lg font-semibold text-[#1F2937] mb-1.5">
              No Announcements
            </h3>
            <p className="text-sm text-[#9CA3AF] mb-6 max-w-sm mx-auto">
              There are no announcements to display. The marquee will show fallback text if enabled.
            </p>
            <Button onClick={() => handleOpenModal()}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Announcement
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {dataList.map((item) => (
            <Card
              key={item.id}
              className="bg-[#FFFFFF] border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] rounded-xl hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-[#1F2937]">
                        {item.text}
                      </h3>
                      {!item.isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#4B5563] text-xs font-medium">
                          Disabled
                        </span>
                      )}
                    </div>
                    {item.link && (
                      <p className="text-sm text-[#6B7280]">
                        Link: <a href={item.link} target="_blank" rel="noreferrer" className="text-primary hover:underline">{item.link}</a>
                      </p>
                    )}
                    <p className="text-xs text-[#9CA3AF]">
                      Order: {item.order}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-[#E5E7EB] pt-4 md:pt-0 md:pl-6">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-[#4B5563]">
                        Active
                      </span>
                      <Switch
                        checked={item.isActive}
                        onCheckedChange={() => toggleActive(item.id, item.isActive)}
                      />
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-xs font-medium text-[#4B5563]">
                        Scrolls
                      </span>
                      <Switch
                        checked={item.isScrollable}
                        onCheckedChange={async () => {
                          await announcements.updateAnnouncement(item.id, { isScrollable: !item.isScrollable });
                          toast.success("Scroll setting changed");
                          fetchData();
                        }}
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#6B7280] hover:text-[#4CAF50] hover:bg-[#E8F5E9]"
                      onClick={() => handleOpenModal(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-[#EF4444] hover:bg-[#FEF2F2]"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Announcement" : "Create Announcement"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text">Announcement Text</Label>
                <Input
                  id="text"
                  placeholder="e.g. Diwali Sale is Live!"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  placeholder="e.g. /products?sale=diwali"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>
              <div className="flex gap-4">
                <div className="space-y-2 flex-1">
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2 flex-1 pt-8 self-end pb-1 inline-flex items-center gap-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <div className="space-y-2 flex-1 pt-8 self-end pb-1 inline-flex items-center gap-2">
                  <Switch
                    id="isScrollable"
                    checked={formData.isScrollable}
                    onCheckedChange={(checked) => setFormData({ ...formData, isScrollable: checked })}
                  />
                  <Label htmlFor="isScrollable">Scroll</Label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 border-t pt-4">
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingId ? "Save Changes" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
