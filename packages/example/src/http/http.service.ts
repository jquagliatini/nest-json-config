import { Injectable } from "@nestjs/common";
import { get } from "node:https";
import { json } from "node:stream/consumers";

@Injectable()
export class HttpService {
  get<T>(url: string): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      get(url, { headers: { accept: "application/json" } }, (res) => {
        if (!res.statusCode || res.statusCode > 399)
          return reject(new Error(`Received status code: ${res.statusCode}`));

        return resolve(json(res) as Promise<T>);
      });
    });
  }
}
