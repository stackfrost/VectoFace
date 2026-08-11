import db from "@/lib/prisma";

async function main() {
  const codeName = "SIGMA25";        // Code the user types at checkout
  const discountPct = 25.0;          // 25% discount
  const affiliateRef = "SIGMA_MEMES"; // Linked affiliate refCode

  console.log(`Creating/Updating coupon: ${codeName}...`);

  // 1. Ensure the affiliate account exists
  let affiliate = await db.affiliate.findUnique({
    where: { refCode: affiliateRef },
  });

  if (!affiliate) {
    affiliate = await db.affiliate.create({
      data: {
        refCode: affiliateRef,
        adminName: "Sigma Edits Admin",
        upiId: "admin@upi",
      },
    });
    console.log(`Created new affiliate record for: ${affiliateRef}`);
  }

  // 2. Create or update the coupon linked to this affiliate
  const coupon = await db.coupon.upsert({
    where: { code: codeName },
    update: {
      discountPct,
      affiliateId: affiliate.id,
      isActive: true,
    },
    create: {
      code: codeName,
      discountPct,
      affiliateId: affiliate.id,
      isUnlimited: true,
    },
  });

  console.log(`✅ Success! Coupon "${coupon.code}" (${coupon.discountPct}% OFF) is live and linked to affiliate "${affiliate.refCode}".`);
}

main()
  .catch((e) => {
    console.error("Error creating coupon:", e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });