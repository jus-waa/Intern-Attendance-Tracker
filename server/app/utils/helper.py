from datetime import datetime, time

def checkStatus(actualTime: time, time_in: time) -> str:
    if actualTime < time(8, 0, 0):
        return "Early in"
    elif actualTime == time (8, 0, 0):
        return "Early out"
    elif actualTime > time (5, 0, 0):
        return "Late"
    
def convert_total_hours_to_float(records):
    for record in records:
        if record.total_hours is not None:
            record.total_hours = round(record.total_hours.total_seconds() / 3600, 2)
    return records