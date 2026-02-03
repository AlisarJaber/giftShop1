from io import BytesIO
from datetime import datetime

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from database import get_session
from src.Models.product import Product
from src.Models.category import Category
from src.Utils.deps import require_admin

from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

router = APIRouter(prefix="/export", tags=["export"])

@router.get("/products-pdf")
def export_products_pdf(
    session: Session = Depends(get_session),
    admin=Depends(require_admin),
):
    products = session.exec(
        select(Product).where(Product.is_active == True, Product.is_custom_box == False)
    ).all()

    categories = session.exec(select(Category).where(Category.is_active == True)).all()
    cat_map = {c.id: c.name for c in categories}

    buf = BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4)

    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("GiftShop - Products Inventory", styles["Title"]))
    story.append(
        Paragraph(
            f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
            styles["Normal"]
        )
    )
    story.append(Spacer(1, 12))

    data = [["ID", "Name", "Category", "Quantity", "Price"]]

    for p in products:
        data.append([
            p.id,
            p.name,
            cat_map.get(p.category_id, ""),
            p.quantity,
            p.price,
        ])

    table = Table(data, colWidths=[40, 200, 120, 80, 80])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.black),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("ALIGN", (3, 1), (-1, -1), "CENTER"),
    ]))

    story.append(table)
    story.append(Spacer(1, 10))
    story.append(Paragraph(f"Total products: {len(products)}", styles["Normal"]))

    doc.build(story)
    buf.seek(0)

    return StreamingResponse(
        buf,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=products_inventory.pdf"}
    )