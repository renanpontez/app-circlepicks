import { useMutation } from '@tanstack/react-query';
import { getHttpClient } from '@/core/config';
import { API_ENDPOINTS } from '@/data/api/endpoints';
import { toast } from '@/stores/toast.store';
import i18n from '@/i18n';

interface ReportRequest {
  experience_id: string;
  reason: 'spam' | 'inappropriate' | 'misleading' | 'other';
  description?: string;
}

export function useReportContent() {
  const httpClient = getHttpClient();

  return useMutation({
    mutationFn: (data: ReportRequest) =>
      httpClient.post(API_ENDPOINTS.reports.create, data),
    onSuccess: () => {
      toast.success(
        i18n.t('report.success', 'Report submitted'),
        i18n.t('report.successMessage', 'Thank you for helping keep our community safe.')
      );
    },
    onError: () => {
      toast.error(
        i18n.t('report.error', 'Failed to submit report'),
        i18n.t('report.errorMessage', 'Please try again later.')
      );
    },
  });
}
