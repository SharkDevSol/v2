import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerCard extends StatelessWidget {
  final double width;
  final double height;

  const ShimmerCard({
    super.key,
    this.width = double.infinity,
    this.height = 120,
  });

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor:
          Theme.of(context).brightness == Brightness.light
              ? Colors.grey[300]!
              : Colors.grey[800]!,
      highlightColor:
          Theme.of(context).brightness == Brightness.light
              ? Colors.grey[100]!
              : Colors.grey[700]!,
      child: Card(
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
          ),
        ),
      ),
    );
  }
}

class ShimmerTableRow extends StatelessWidget {
  const ShimmerTableRow({super.key});

  @override
  Widget build(BuildContext context) {
    return Shimmer.fromColors(
      baseColor:
          Theme.of(context).brightness == Brightness.light
              ? Colors.grey[300]!
              : Colors.grey[800]!,
      highlightColor:
          Theme.of(context).brightness == Brightness.light
              ? Colors.grey[100]!
              : Colors.grey[700]!,
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                color: Colors.white,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Container(
                height: 14,
                color: Colors.white,
              ),
            ),
            const SizedBox(width: 16),
            Container(
              width: 80,
              height: 14,
              color: Colors.white,
            ),
          ],
        ),
      ),
    );
  }
}

class DashboardShimmer extends StatelessWidget {
  const DashboardShimmer({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Row(
          children: const [
            Expanded(child: ShimmerCard(height: 140)),
            SizedBox(width: 16),
            Expanded(child: ShimmerCard(height: 140)),
            SizedBox(width: 16),
            Expanded(child: ShimmerCard(height: 140)),
            SizedBox(width: 16),
            Expanded(child: ShimmerCard(height: 140)),
          ],
        ),
        const SizedBox(height: 24),
        const ShimmerCard(height: 300),
      ],
    );
  }
}
