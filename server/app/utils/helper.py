from datetime import datetime, time

def checkStatus(actualTime: time, time_in: time) -> str:
    if actualTime < time(8, 0, 0):
        return "Early in"
    elif actualTime == time (8, 0, 0):
        return "Early out"
    elif actualTime > time (5, 0, 0):
        return "Late"