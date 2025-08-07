import requests
from datetime import date, time
#check status
def checkStatus(actualTime: time, time_in: time) -> str:
    if actualTime < time(8, 0, 0):
        return "Early in"
    elif actualTime == time (8, 0, 0):
        return "Early out"
    elif actualTime > time (5, 0, 0):
        return "Late"
#secs to hours
def convert_total_hours_to_float(records):
    for record in records:
        if record.total_hours is not None:
            record.total_hours = round(record.total_hours.total_seconds() / 3600, 2)

        if record.time_remain is not None:
            record.time_remain = round(record.time_remain.total_seconds() / 3600, 2)
    return records

def convert_total_hours_single(records):
    if records.total_hours is not None:
        records.total_hours = round(records.total_hours.total_seconds() / 3600, 2)
    if records.time_remain is not None:
        records.time_remain = round(records.time_remain.total_seconds() / 3600, 2)
    return records

def convert_remaining(records):
    if records.time_remain is not None:
        records.time_remain = round(records.time_remain.total_seconds() / 3600, 2)

def convert_total_hours(records):
    for record in records:
        if record.total_hours is not None:
            record.total_hours = round(record.total_hours.total_seconds() / 3600, 2)
    return records
#holiday checker api
def is_today_holiday():
    today = date.today().isoformat()  # 'YYYY-MM-DD'
    year = date.today().year
    url = f"https://date.nager.at/api/v3/PublicHolidays/{year}/PH"
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        holidays = response.json()
        return any(holiday["date"] == today for holiday in holidays)
    except requests.RequestException as e:
        print(f"Error checking holiday: {e}")
        return False  # Treat as non-holiday if API fails