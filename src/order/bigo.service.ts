import { Injectable } from '@nestjs/common';
import axios, { Axios } from 'axios';
import { readFileSync } from 'fs';
import { createSign } from 'crypto';
import * as qs from 'qs';
import {
  DisableRechargeDto,
  GetAccessTokenDto,
  GetUserInfoDto,
  PreCheckDto,
  RechargeDiamondDto,
} from './dto/bigo.dto';

@Injectable()
export class BigoService {
  private readonly clientId = process.env.BIGO_CLIENT_ID;
  private readonly clientSecret = process.env.BIGO_CLIENT_SECRET;
  private readonly redirectUri = process.env.BIGO_REDIRECT_URI;
  private readonly resellerBigoId = process.env.BIGO_RESELLER_ID;
  private readonly privateKey = readFileSync('bigo_private.pem', 'utf8');
  private readonly bigo: Axios;

  constructor() {
    this.bigo = axios.create({
      baseURL: 'https://oauth.bigolive.tv',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private generateSignature(
    data: string,
    endpoint: string,
    timestamp: number,
  ): string {
    const signData = `${data}${endpoint}${timestamp}`;
    const signer = createSign('RSA-SHA256');
    signer.update(signData);
    return signer.sign(this.privateKey, 'base64');
  }

  async getAccessToken({ code }: GetAccessTokenDto): Promise<any> {
    const response = await this.bigo.post(
      '/oauth2/token',
      qs.stringify({
        code,
        grant_type: 'authorization_code',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      },
    );
    return response.data;
  }

  async getUserInfo({ accessToken }: GetUserInfoDto): Promise<any> {
    const response = await this.bigo.post('/oauth2/userV2', null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }

  async rechargeDiamond({
    rechargeBigoId,
    buOrderId,
    value,
    totalCost,
    currency,
  }: RechargeDiamondDto) {
    const endpoint = '/sign/agent/rs_recharge';
    const timestamp = Math.floor(Date.now() / 1000);
    const body = {
      recharge_bigoid: rechargeBigoId,
      reseller_bigoid: this.resellerBigoId,
      seqid: buOrderId,
      bu_orderid: buOrderId,
      value,
      total_cost: totalCost,
      currency,
    };
    const signature = this.generateSignature(
      JSON.stringify(body),
      endpoint,
      timestamp,
    );
    const response = await this.bigo.post(endpoint, body, {
      headers: {
        'bigo-client-id': this.clientId,
        'bigo-oauth-signature': signature,
        'bigo-timestamp': timestamp.toString(),
      },
    });
    return response.data;
  }

  async preCheck({ rechargeBigoId, seqid }: PreCheckDto) {
    const endpoint = '/sign/agent/recharge_pre_check';
    const timestamp = Math.floor(Date.now() / 1000);
    const body = {
      recharge_bigoid: rechargeBigoId,
      reseller_bigoid: this.resellerBigoId,
      seqid,
    };
    const signature = this.generateSignature(
      JSON.stringify(body),
      endpoint,
      timestamp,
    );
    const response = await this.bigo.post(endpoint, body, {
      headers: {
        'bigo-client-id': this.clientId,
        'bigo-oauth-signature': signature,
        'bigo-timestamp': timestamp.toString(),
      },
    });
    return response.data;
  }

  async disableRecharge({ seqid }: DisableRechargeDto) {
    const endpoint = '/sign/agent/disable';
    const timestamp = Math.floor(Date.now() / 1000);
    const body = { seqid };
    const signature = this.generateSignature(
      JSON.stringify(body),
      endpoint,
      timestamp,
    );
    const response = await this.bigo.post(endpoint, body, {
      headers: {
        'bigo-client-id': this.clientId,
        'bigo-oauth-signature': signature,
        'bigo-timestamp': timestamp.toString(),
      },
    });
    return response.data;
  }
}
