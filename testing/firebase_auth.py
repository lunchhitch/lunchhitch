import requests

def main():
    resp = requests.post('http://localhost:3000/api/orders?fulfilled=true&shopId=')
    print(resp.text)

if __name__ == "__main__":
    main()
