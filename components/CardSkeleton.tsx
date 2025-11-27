"use client";

import { Skeleton, Card, Row, Col } from "antd";

export default function CardSkeleton() {
  return (
    <Card
      className="h-full shadow-md rounded-xl overflow-hidden border-0"
      cover={
        <div className="h-52 bg-gray-200 animate-pulse" />
      }
      styles={{ body: { padding: "18px 16px 8px 16px", minHeight: 120 } }}
    >
      <Skeleton active paragraph={{ rows: 2 }} />
    </Card>
  );
}

export function CardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <Row gutter={[24, 24]}>
      {Array.from({ length: count }).map((_, i) => (
        <Col xs={24} sm={12} lg={8} key={i}>
          <CardSkeleton />
        </Col>
      ))}
    </Row>
  );
}
