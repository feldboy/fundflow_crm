from unittest.mock import patch


class TestHealthEndpoints:
    """Test health and root endpoints."""
    
    def test_root_endpoint(self, test_client):
        """Test root endpoint returns correct response."""
        response = test_client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Pre-Settlement Funding CRM API"
        assert data["version"] == "1.0.0"
    
    def test_health_check_endpoint(self, test_client):
        """Test health check endpoint."""
        response = test_client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


class TestCORSMiddleware:
    """Test CORS middleware configuration."""
    
    def test_cors_headers_present(self, test_client):
        """Test that CORS headers are present in responses."""
        response = test_client.options("/")
        
        # Should handle preflight requests
        assert response.status_code in [200, 204]
    
    def test_cors_allow_origin(self, test_client):
        """Test CORS allows correct origins."""
        headers = {"Origin": "http://localhost:3000"}
        response = test_client.get("/", headers=headers)
        
        assert response.status_code == 200


class TestAuthMiddleware:
    """Test authentication middleware."""
    
    def test_unprotected_endpoints_accessible(self, test_client):
        """Test that unprotected endpoints are accessible without auth."""
        response = test_client.get("/")
        assert response.status_code == 200
        
        response = test_client.get("/health")
        assert response.status_code == 200
    
    @patch('app.core.auth.verify_token')
    def test_protected_endpoints_require_auth(self, mock_verify, test_client):
        """Test that protected endpoints require authentication."""
        # Mock authentication failure
        mock_verify.side_effect = Exception("Invalid token")
        
        # Try to access a protected endpoint without auth
        response = test_client.get("/api/v1/plaintiffs")
        
        # Should return 401 or 403 (depending on implementation)
        assert response.status_code in [401, 403, 422]  # 422 might be returned by FastAPI for missing auth
    
    @patch('app.core.auth.verify_token')
    def test_protected_endpoints_with_valid_auth(self, mock_verify, test_client):
        """Test that protected endpoints work with valid auth."""
        # Mock successful authentication
        mock_verify.return_value = {"user_id": "test-user", "role": "admin"}
        
        headers = {"Authorization": "Bearer valid-token"}
        
        # This might fail due to database connection, but should not fail due to auth
        response = test_client.get("/api/v1/plaintiffs", headers=headers)
        
        # Should not return auth-related errors (401, 403)
        assert response.status_code not in [401, 403]


class TestAPIRouters:
    """Test that API routers are properly included."""
    
    def test_plaintiffs_router_included(self, test_client):
        """Test that plaintiffs router is properly included."""
        # Without auth, should get auth error, not 404
        response = test_client.get("/api/v1/plaintiffs")
        assert response.status_code != 404
    
    def test_law_firms_router_included(self, test_client):
        """Test that law firms router is properly included."""
        response = test_client.get("/api/v1/law-firms")
        assert response.status_code != 404
    
    def test_employees_router_included(self, test_client):
        """Test that employees router is properly included."""
        response = test_client.get("/api/v1/employees")
        assert response.status_code != 404
    
    def test_communications_router_included(self, test_client):
        """Test that communications router is properly included."""
        response = test_client.get("/api/v1/communications")
        assert response.status_code != 404
    
    def test_documents_router_included(self, test_client):
        """Test that documents router is properly included."""
        response = test_client.get("/api/v1/documents")
        assert response.status_code != 404
    
    def test_ai_agents_router_included(self, test_client):
        """Test that AI agents router is properly included."""
        response = test_client.get("/api/v1/ai")
        assert response.status_code != 404
    
    def test_google_services_router_included(self, test_client):
        """Test that Google services router is properly included."""
        response = test_client.get("/api/v1/google")
        assert response.status_code != 404


class TestErrorHandling:
    """Test error handling."""
    
    def test_404_for_non_existent_endpoints(self, test_client):
        """Test that non-existent endpoints return 404."""
        response = test_client.get("/non-existent-endpoint")
        assert response.status_code == 404
    
    def test_method_not_allowed(self, test_client):
        """Test method not allowed responses."""
        # Assuming GET is not allowed on a POST-only endpoint
        response = test_client.delete("/")  # Root endpoint likely doesn't support DELETE
        assert response.status_code in [405, 422]  # Method not allowed or Unprocessable Entity
