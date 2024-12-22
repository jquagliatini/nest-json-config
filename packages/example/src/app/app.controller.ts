import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { AppService, Post } from "./app.service";

@Controller("posts")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(":id")
  getPost(@Param("id", ParseIntPipe) id: number): Promise<Post> {
    return this.appService.getPost(id);
  }
}
