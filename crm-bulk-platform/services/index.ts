import { updateContactService } from './updateContactService';

export const actionHandlers: Record<string, (jobId: string, contacts: any[], transaction: any) => Promise<{ successCount: number; failureCount: number }>> = {
  'contact.update': updateContactService,
};
