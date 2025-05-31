import {
  Injectable,
  ValidationPipe,
  ValidationPipeOptions,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class GlobalPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      (metadata.metatype?.name === 'TBankWebhookDto' ||
        metadata.metatype?.name === 'PagsmileNotificationDto')
    ) {
      this.validatorOptions.whitelist = false;
      this.validatorOptions.forbidNonWhitelisted = false;
    }

    return super.transform(value, metadata);
  }
}
