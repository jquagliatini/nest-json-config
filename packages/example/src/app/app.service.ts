import { Config } from "@jqgl/nest-json-config";
import { Injectable } from "@nestjs/common";
import { HttpService } from "../http";

@Injectable()
export class AppService {
  constructor(
    private readonly http: HttpService,
    private readonly config: Config,
  ) {}

  getPost(id: number): Promise<Post> {
    const url = new URL(
      `/posts/${id}`,
      this.config.remoteBlog.baseUrl,
    ).toString();

    return this.http.get<Post>(url);
  }
}

export type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};
