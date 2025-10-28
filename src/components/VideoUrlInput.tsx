import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { VideoType, VideoMetadata } from '@/types/quiz';
import { Play, X, AlertCircle } from 'lucide-react';

interface VideoUrlInputProps {
  value: VideoMetadata | null;
  onChange: (video: VideoMetadata | null) => void;
  disabled?: boolean;
}

export const VideoUrlInput: React.FC<VideoUrlInputProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [url, setUrl] = useState<string>(value?.url || '');
  const [isValidating, setIsValidating] = useState<boolean>(false);

  useEffect(() => {
    if (value?.url) {
      setUrl(value.url);
    }
  }, [value]);

  const detectVideoType = (videoUrl: string): VideoType | null => {
    const normalizedUrl = videoUrl.trim().toLowerCase();

    // YouTube detection
    if (
      normalizedUrl.includes('youtube.com/watch') ||
      normalizedUrl.includes('youtu.be/') ||
      normalizedUrl.includes('youtube.com/embed/')
    ) {
      return 'youtube';
    }

    // Vimeo detection
    if (normalizedUrl.includes('vimeo.com/')) {
      return 'vimeo';
    }

    // Bunny.net detection
    if (
      normalizedUrl.includes('bunnycdn.com') ||
      normalizedUrl.includes('b-cdn.net')
    ) {
      return 'bunny';
    }

    // Direct video file detection
    if (
      normalizedUrl.match(/\.(mp4|webm|ogg|mov|avi|mkv)(\?|$)/i)
    ) {
      return 'direct';
    }

    return null;
  };

  const extractYouTubeThumbnail = (videoUrl: string): string | undefined => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/;
    const match = videoUrl.match(regex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return undefined;
  };

  const extractVimeoId = (videoUrl: string): string | null => {
    const regex = /vimeo\.com\/(\d+)/;
    const match = videoUrl.match(regex);
    return match ? match[1] : null;
  };

  const validateAndSetVideo = async () => {
    if (!url.trim()) {
      onChange(null);
      return;
    }

    setIsValidating(true);

    try {
      const videoType = detectVideoType(url);

      if (!videoType) {
        toast({
          title: t('error'),
          description: t('videoUrlInvalid'),
          variant: 'destructive',
        });
        setIsValidating(false);
        return;
      }

      let thumbnail: string | undefined;

      if (videoType === 'youtube') {
        thumbnail = extractYouTubeThumbnail(url);
      } else if (videoType === 'vimeo') {
        const vimeoId = extractVimeoId(url);
        if (vimeoId) {
          try {
            const response = await fetch(`https://vimeo.com/api/v2/video/${vimeoId}.json`);
            if (response.ok) {
              const data = await response.json();
              thumbnail = data[0]?.thumbnail_large;
            }
          } catch (error) {
            console.error('Failed to fetch Vimeo thumbnail:', error);
          }
        }
      }

      const videoMetadata: VideoMetadata = {
        url: url.trim(),
        type: videoType,
        thumbnail,
      };

      onChange(videoMetadata);

      toast({
        title: t('success'),
        description: t('videoUrlValid'),
      });
    } catch (error) {
      console.error('Video validation error:', error);
      toast({
        title: t('error'),
        description: t('videoValidationFailed'),
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveVideo = () => {
    setUrl('');
    onChange(null);
    toast({
      title: t('success'),
      description: t('videoRemoved'),
    });
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateAndSetVideo();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="video-url">{t('videoUrl')}</Label>
        <div className="flex gap-2">
          <Input
            id="video-url"
            type="url"
            placeholder={t('videoUrlPlaceholder')}
            value={url}
            onChange={handleUrlChange}
            onKeyPress={handleKeyPress}
            disabled={disabled || isValidating}
            className="flex-1"
          />
          <Button
            type="button"
            onClick={validateAndSetVideo}
            disabled={disabled || isValidating || !url.trim()}
            variant="secondary"
          >
            {isValidating ? t('validating') : t('validate')}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('videoUrlSupported')}
        </p>
      </div>

      {value && (
        <Card className="p-4">
          <div className="flex items-start gap-4">
            {value.thumbnail ? (
              <div className="relative w-32 h-20 flex-shrink-0 rounded overflow-hidden bg-muted">
                <img
                  src={value.thumbnail}
                  alt={t('videoPreview')}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="w-32 h-20 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium capitalize">
                  {value.type}
                </span>
                {value.type === 'bunny' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                    {t('privateVideo')}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {value.url}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemoveVideo}
              disabled={disabled}
              className="flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {url && !value && !isValidating && (
        <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-500">
          <AlertCircle className="w-4 h-4" />
          <span>{t('videoNotValidated')}</span>
        </div>
      )}
    </div>
  );
};
