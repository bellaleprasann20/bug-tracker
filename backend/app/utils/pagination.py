from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class PaginationMetadata(BaseModel):
    page: int
    page_size: int
    total_items: int
    total_pages: int
    has_next: bool
    has_previous: bool


class PaginatedResponse(BaseModel):
    success: bool = True
    data: list[Any] = Field(default_factory=list)
    pagination: PaginationMetadata


def calculate_pagination(
    page: int,
    page_size: int,
    total_items: int,
) -> PaginationMetadata:
    if page < 1:
        raise ValueError("Page must be greater than or equal to 1.")

    if page_size < 1:
        raise ValueError("Page size must be greater than or equal to 1.")

    if total_items < 0:
        raise ValueError("Total items cannot be negative.")

    total_pages = (
        (total_items + page_size - 1) // page_size
    )

    return PaginationMetadata(
        page=page,
        page_size=page_size,
        total_items=total_items,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_previous=page > 1 and total_pages > 0,
    )


def create_paginated_response(
    data: list[Any],
    page: int,
    page_size: int,
    total_items: int,
) -> PaginatedResponse:
    metadata = calculate_pagination(
        page=page,
        page_size=page_size,
        total_items=total_items,
    )

    return PaginatedResponse(
        data=data,
        pagination=metadata,
    )


def get_pagination_offset(
    page: int,
    page_size: int,
) -> int:
    if page < 1:
        raise ValueError("Page must be at least 1.")

    if page_size < 1 or page_size > 100:
        raise ValueError("Page size must be between 1 and 100.")

    return (page - 1) * page_size