import React, { useRef, useState } from "react";
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import { Paperclip, Send, X } from "lucide-react";

// Ничего не придумываю, использую твои internal imports и логику

export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const { user, profile } = useUser();
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
      <DialogHeader className="flex flex-row items-center justify-between mb-2">
        <DialogTitle className="text-lg font-bold">{t("support.title", "Связаться с поддержкой")}</DialogTitle>
        <Button variant="ghost" size="icon" onClick={handleClose}>
          <X className="h-5 w-5" />
        </Button>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <DialogContent className="space-y-4 pt-2">
          <label className="block text-sm font-medium mb-2">
            {t("support.messageLabel", "Ваше сообщение")}
          </label>
          <Textarea
            placeholder={t("support.messagePlaceholder", "Опишите проблему или задайте вопрос")}
            rows={4}
            required
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={sending || sent}
            maxLength={3000}
          />
          <label className="block text-sm font-medium mt-4 mb-1">
            {t("support.attachment", "Вложение (картинка, PDF или другое)")}
          </label>
          <div className="flex items-center gap-2">
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
          {/* Email пользователя подтягиваем, если есть */}
          <Input
            type="email"
            placeholder="E-mail"
            value={profile?.email ?? user?.email ?? ""}
            disabled
            className="mt-2"
          />
          {sent && (
            <div className="text-green-600 text-sm mt-2">
              {t("support.success", "Спасибо, сообщение отправлено! Мы свяжемся с вами как можно скорее.")}
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button
            type="submit"
            variant="primary"
            disabled={sending || sent || !message}
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            {sending
              ? t("support.sending", "Отправка…")
              : sent
                ? t("support.sent", "Отправлено")
                : t("support.send", "Отправить")}
          </Button>
          <Button type="button" variant="secondary" onClick={handleClose}>
            {t("support.cancel", "Отмена")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}
