import qrcode, os

def generateQrCode(data_uuid: str, filename:str):     
    qr = qrcode.QRCode(version=1, box_size=10, border=4) #(version, box_size, border)
    qr.add_data(data_uuid)
    qr.make(fit=True)
    img = qr.make_image(fill="black", back_color="white") #(fill, back_color)
    #result = img.to_string()
    #result = str(result)
    
    os.makedirs("qrcodes", exist_ok=True)
    
    path = f"qrcodes/{filename}.png"
    img.save(path)
    return path

    



