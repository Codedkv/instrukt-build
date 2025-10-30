import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Paperclip, Send, X } from "lucide-react";

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setMessage("");
      setFile(null);
    }, 1200);
  };
  const handleClose = () => { setSent(false); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        {/* Один заголовок и один крестик */}
        <div className="flex flex-row items-center justify-between mb-2">
          <span className="text-lg font-bold">{t("support.title", "Ваше сообщение")}</span>
          <Button variant="ghost" size="icon" onClick={handleClose} tabIndex={-1}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <form onSubmit={handleSubmit}>
          <Textarea
            placeholder={t("support.messagePlaceholder", "Опишите проблему или задайте вопрос")}
            rows={4}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending || sent}
            maxLength={3000}
          />
          <div className="flex items-center gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAttachClick}
              disabled={sending || sent}
            >
              <Paperclip className="h-4 w-4 mr-1" />
              {file ? file.name : t("support.attach", "Прикрепить файл")}
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              disabled={sending || sent}
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
            />
            {file && (
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() => setFile(null)}
                disabled={sending || sent}
                aria-label={t("support.removeFile", "Удалить")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {sent && (
            <div className="text-green-600 text-sm mt-2">
              {t("support.success", "Спасибо, сообщение отправлено! Мы свяжемся с вами как можно скорее и пришлём ответ на почту.")}
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={sending || sent || !message}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {t("support.send", "Отправить")}
            </Button>
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t("support.cancel", "Отмена")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
