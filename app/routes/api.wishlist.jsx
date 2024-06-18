import { json } from "@remix-run/node";
import db from "../db.server";
import { cors } from "remix-utils/cors";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!customerId || !productId || !shop) {
    return json({
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET",
    });
  }

  const wishlist = await db.wishlist.findMany({
    where: {
      customerId,
      productId,
      shop,
    },
  });

  const response = json({
    message: "Product successfully added to wishlist",
    ok: true,
    wishlist: wishlist,
  });
  return cors(request, response);
}

export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);
  const customerId = data.customerId;
  const productId = data.productId;
  const shop = data.shop;
  const _action = data._action;

  if (!customerId || !productId || !shop || !_action) {
    return json({
      message:
        "Missing data. Required data: customerId, productId, shop, _action",
      method: _action,
    });
  }

  let response;

  switch (_action) {
    case "CREATE":
      const wishlist = await db.wishlist.create({
        data: {
          customerId,
          productId,
          shop,
        },
      });

      response = json({
        message: "Product added to wishlist",
        method: _action,
        wishlisted: true,
      });
      return cors(request, response);

    case "PATCH":
      return json({ message: "Success", method: "PATCH" });

    case "DELETE":
      await db.wishlist.deleteMany({
        where: {
          customerId,
          shop,
          productId,
        },
      });

      response = json({message: "Product removed from your wishlist", method: _action, wishlisted: false})
      return cors(request, response)

      default:
        return new Response("Method Not Allowed", {status: 405})
  }
}
