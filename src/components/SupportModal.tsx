import React, { useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Paperclip, Send, X } from "lucide-react";

export function SupportModal({ open, onClose, user }: { open: boolean; onClose: () => void; user?: { email?: string; id?: string } }) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleAttachClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null);

  const validateEmail = (e: string) => {
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Проверка email только для незарегистрированных
    if (!user?.id) {
      if (!validateEmail(email)) {
        setEmailError(t("support.emailRequired", "Пожалуйста, укажите ваш email"));
        return;
      }
      setEmailError("");
    }

    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
      setMessage("");
      setFile(null);
      setEmail("");
    }, 1200);
  };
  const handleClose = () => { setSent(false); onClose(); };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <div className="mb-2">
          <span className="text-lg font-bold">{t("support.title", "Ваше сообщение")}</span>
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
          {/* field: email (только для незарегистрированных) */}
          {!user?.id && (
            <div className="mt-4">
              <Input
                type="email"
                placeholder={t("support.emailPlaceholder", "Введите ваш email")}
                value={email}
                required
                onChange={e => setEmail(e.target.value)}
                disabled={sending || sent}
                className={emailError ? "border-red-500" : ""}
              />
              {emailError && <div className="text-red-500 text-xs mt-1">{emailError}</div>}
            </div>
          )}
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
              Спасибо, сообщение отправлено! Мы свяжемся с Вами по почте, указанной при регистрации в PerplexitySchool.
            </div>
          )}
          <div className="flex justify-end gap-2 mt-6">
            <Button
              type="submit"
              variant="primary"
              disabled={sending || sent || !message || (!user?.id && !email)}
              className="gap-2 hover:bg-primary/90"
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
