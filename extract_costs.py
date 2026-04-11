import pandas as pd
import json

file_path = r'c:\Users\Gandharva Khedekar\OneDrive\Desktop\QUanthacks\KisanSetu-HiveX\Hardware and Cloud Service costing.xlsx'

try:
    xl = pd.ExcelFile(file_path)
    data = {}
    for sheet_name in xl.sheet_names:
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        data[sheet_name] = df.to_dict(orient='records')
    
    with open('costs.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("Exported to costs.json")

except Exception as e:
    print(f"Error: {e}")
