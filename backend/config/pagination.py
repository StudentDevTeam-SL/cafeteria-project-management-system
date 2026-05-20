from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    """
    Standard pagination class for cafeteria models.
    Defaults to 50 results per page, with custom 'page_size' override capability.
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 1000
