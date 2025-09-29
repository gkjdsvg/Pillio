from urllib import request

# Create your views here.
#

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny

from LoadCSV.MedicineLoader import MedicineLoader

loader = MedicineLoader()
loader.load_csv()

@api_view(['GET'])
@permission_classes([AllowAny])
def search(request) :
    query = request.GET.get("item_name", "").strip()

    results = loader.search_by_partial_name(query)
    items = [m["item_name"] for m in results]

    return JsonResponse(
        {"results": results},
        json_dumps_params={'ensure_ascii': False},
    )


def test_debug_find(request) :
    query = request.GET.get("item", "")
    loader.debug_find(query)

    return JsonResponse({"results": loader.debug_find(query)})


if __name__ == "__main__":
    loader = MedicineLoader()
    loader.load_csv()
    print("총 로드된 개수:", len(loader.medicine_map))

    # 예시 검색
    results = loader.search_by_partial_name("쿠티아핀정")
    print("검색 결과:", results[:5])
