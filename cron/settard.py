from settrade_v2 import Investor
import os
from dotenv import load_dotenv

load_dotenv()

investor = Investor(
    app_id=os.getenv("APP_ID"),
    app_secret=os.getenv("APP_SECRET"),
    broker_id=os.getenv("BROKER_ID"),
    app_code=os.getenv("APP_CODE"),
    is_auto_queue=os.getenv("IS_AUTO_QUEUE")
)

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

