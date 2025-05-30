export class PaginationMetaDto {
  total: number;
  page: number;
  take: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;

  constructor(total: number, page: number, take: number) {
    this.total = total;
    this.page = page;
    this.take = take;
    this.totalPages = Math.ceil(total / take);
    this.hasNextPage = page < this.totalPages;
    this.hasPrevPage = page > 1;
  }
}