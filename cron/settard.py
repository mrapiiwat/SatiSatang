from settrade_v2 import Investor
from pprint import pprint

def get_quote_symbol(symbol):
    try:
        mkt_data = investor.MarketData()
        res = mkt_data.get_quote_symbol(symbol)
        return res
    except KeyError:
        print(f"Error: ไม่มี symbol '{symbol}' ในผลลัพธ์")
        return None
    except Exception as e:
        print(f"เกิดข้อผิดพลาด: {e}")
        return None


investor = Investor(
    app_id="zFZAvt8TMiNy5C35",
    app_secret="ARluY1VFoaOsVa3Q3hR3F1Ob3BrqGN3XLq9VCua+JVg=",
    broker_id="SANDBOX",
    app_code="SANDBOX",
    is_auto_queue=False
)

