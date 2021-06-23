import serial, time

serialPort = serial.Serial(
    port='/dev/ttyACM0',
    baudrate = 115200,
    parity=serial.PARITY_NONE,
    stopbits=serial.STOPBITS_ONE,
    bytesize=serial.EIGHTBITS,
    timeout=1
)
time.sleep(1)
if serialPort:
    print("here")
    serialPort.write(b'\x03')
    serialPort.write(b'\x04')
    time.sleep(1)
