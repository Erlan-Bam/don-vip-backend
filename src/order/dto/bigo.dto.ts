export class GetAccessTokenDto {
  code: string;
}

export class GetUserInfoDto {
  accessToken: string;
}

export class RechargeDiamondDto {
  rechargeBigoId: string;
  buOrderId: string;
  value: number;
  totalCost: number;
  currency: string;
}

export class PreCheckDto {
  rechargeBigoId: string;
  seqid: string;
}

export class DisableRechargeDto {
  seqid: string;
}
